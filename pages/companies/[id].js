import { useState, useMemo } from 'react';
import {
  Box, Container, Heading, Text, Tabs, TabList, TabPanels, Tab, TabPanel,
  Table, Thead, Tbody, Tr, Th, Td, Badge, HStack, VStack, Link as ChakraLink,
  SimpleGrid, Card, CardBody, Divider, Icon, Breadcrumb, BreadcrumbItem, BreadcrumbLink,
  Alert, AlertIcon, AlertTitle, AlertDescription,
  Menu, MenuButton, MenuList, MenuItem, Button, Flex, Stack, CardFooter, Image
} from '@chakra-ui/react';
import { FaExternalLinkAlt, FaCalendarAlt, FaNewspaper, FaBuilding, FaChevronRight, FaFilter, FaChevronDown, FaCheck } from 'react-icons/fa';
import { getCompanyData, getAllCompanyIds } from '../../lib/gcs-api-server';
import Layout from '../../components/Layout';
import Link from 'next/link';

const FacilityCard = ({ facility, companyId }) => {
  const getProgramBadges = () => {
    const programs = [];
    if (facility.programs?.air) programs.push({ name: '空氣', color: 'purple' });
    if (facility.programs?.water) programs.push({ name: '水', color: 'blue' });
    if (facility.programs?.waste) programs.push({ name: '廢棄物', color: 'orange' });
    if (facility.programs?.toxics) programs.push({ name: '有毒物質', color: 'red' });
    return programs.length > 0 ? programs : [{ name: '無監控', color: 'gray' }];
  };

  return (
    <Card boxShadow="md" borderRadius="lg" h="100%">
      <CardBody>
        <Stack spacing="3">
          <Heading size="sm">{facility.name}</Heading>
          <HStack>
            <Icon as={FaBuilding} />
            <Text color="gray.600" fontSize="sm">{facility.city}, {facility.state}, {facility.country}</Text>
          </HStack>
          <Text color="gray.600" fontSize="xs">設施 ID: {facility.facilityId}</Text>
          {facility.shareholding && (
            <Text color="gray.600" fontSize="xs">持股比例: {facility.shareholding}</Text>
          )}
          <HStack flexWrap="wrap" gap={2}>
            {getProgramBadges().map((program, idx) => (
              <Badge key={idx} colorScheme={program.color} px={2} py={1} borderRadius="full" fontSize="0.7em">
                {program.name}
              </Badge>
            ))}
          </HStack>
        </Stack>
      </CardBody>
      <Divider />
      <CardFooter>
        <Link href={`/companies/${companyId}/facilities/${facility.facilityId}`} legacyBehavior>
          <Button as="a" colorScheme="green" w="100%" size="sm">
            查看詳情
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

const CompanyDetail = ({ companyData }) => {
  const [selectedViolationPlant, setSelectedViolationPlant] = useState('all');
  const [selectedNewsPlant, setSelectedNewsPlant] = useState('all');

  if (!companyData) {
    return (
      <Layout>
        <Container maxW="container.xl" py={10}>
          <Alert status="error">
            <AlertIcon />
            <AlertTitle>無法載入公司資訊！</AlertTitle>
            <AlertDescription>請確認公司ID是否正確。</AlertDescription>
          </Alert>
        </Container>
      </Layout>
    );
  }

  const companyInfo = {
    name: companyData.name,
    englishName: companyData.englishName,
    facilityId: companyData.id,
    facilityName: companyData.facilities?.[0]?.name || '總公司',
    address: companyData.address || companyData.facilities?.[0]?.address || 'N/A',
    industry: companyData.industry || 'N/A',
    reportUrl: companyData.website || 'N/A',
    logoUrl: companyData.logoUrl,
    foundedYear: companyData.foundedDate?.substring(0, 4) || 'N/A',
    foundedDate: companyData.foundedDate || 'N/A',
    listedDate: companyData.listedDate || 'N/A',
    companyType: companyData.companyType || 'N/A',
    companyCode: companyData.companyCode || 'N/A',
    chairman: companyData.chairman || 'N/A',
    capital: companyData.capital || 'N/A',
    totalFacilities: companyData.facilities?.length || 0,
    totalViolations: companyData.violations?.length || 0,
    totalEnforcements: companyData.enforcement?.length || 0
  };

  const violationData = companyData.violations?.map(v => ({
    caseNumber: v.violationId,
    date: v.date,
    endDate: v.endDate,
    type: v.violationTypeDesc || v.violationType || 'Environmental Violation',
    violationCode: v.violationCode,
    description: v.description,
    comment: v.comment,
    status: v.status,
    source: v.source,
    plantSite: v.plantSite,
    fine: v.fine || 'N/A',
    agencyType: v.agencyType,
    parameterCode: v.parameterCode,
    parameterDesc: v.parameterDesc,
    limitValue: v.limitValue,
    dmrValue: v.dmrValue,
    exceedencePct: v.exceedencePct,
    standardUnit: v.standardUnit,
    monitoringPeriodEndDate: v.monitoringPeriodEndDate,
    valueReceivedDate: v.valueReceivedDate,
    scheduleDate: v.scheduleDate,
    actualDate: v.actualDate
  })) || [];

  const newsData = { international: [], domestic: [] };

  // Extract plant site options from violations data to ensure exact match
  const violationPlantSites = [...new Set(
    violationData
      .map(v => v.plantSite)
      .filter(site => site && site !== 'N/A')
  )];
  const plantSiteOptions = [
    { value: 'all', label: '所有廠區' },
    ...violationPlantSites.sort().map(site => ({ value: site, label: site }))
  ];

  // Memoized filtered violations
  const filteredViolations = useMemo(() => {
    if (selectedViolationPlant === 'all') {
      return violationData;
    }
    return violationData.filter(v => v.plantSite === selectedViolationPlant);
  }, [violationData, selectedViolationPlant]);

  // Memoized filtered news
  const filteredNews = useMemo(() => {
    const filterBySite = (newsItems, site) => {
      if (site === 'all') return newsItems;
      return newsItems.filter(n => n.plantSite === site);
    };
    return {
      international: filterBySite(newsData.international, selectedNewsPlant),
      domestic: filterBySite(newsData.domestic, selectedNewsPlant),
    };
  }, [newsData, selectedNewsPlant]);

  // Helper to get the label for the selected plant value
  const getSelectedPlantLabel = (selectedValue) => {
    const selectedOption = plantSiteOptions.find(option => option.value === selectedValue);
    return selectedOption ? selectedOption.label : '選擇廠區';
  };

  // 違規類型的顏色配置
  const getViolationTypeColor = (type) => {
    if (!type) return 'gray';
    if (type.toLowerCase().includes('air')) return 'red';
    if (type.toLowerCase().includes('water')) return 'blue';
    if (type.toLowerCase().includes('waste') || type.toLowerCase().includes('rcra')) return 'orange';
    if (type.toLowerCase().includes('海洋')) return 'cyan';
    return 'gray';
  };

  // 違規狀態的顏色配置
  const getViolationStatusColor = (status) => {
    if (!status) return 'gray';
    switch (status.toLowerCase()) {
      case 'active': return 'red';
      case 'concluded': return 'green';
      case 'unknown': return 'yellow';
      default: return 'gray';
    }
  };

  return (
    <Layout>
      <Box bg="green.50" py={6}>
        <Container maxW="container.xl">
          <Breadcrumb spacing="8px" separator={<FaChevronRight color="gray.500" />}>
            <BreadcrumbItem>
              <Link href="/" legacyBehavior>
                <BreadcrumbLink>首頁</BreadcrumbLink>
              </Link>
            </BreadcrumbItem>

            <BreadcrumbItem>
              <Link href="/companies" legacyBehavior>
                <BreadcrumbLink>企業列表</BreadcrumbLink>
              </Link>
            </BreadcrumbItem>

            <BreadcrumbItem>
              <Link href="/companies" legacyBehavior>
                <BreadcrumbLink>{companyInfo ? companyInfo.name.split(' (')[0] : '公司'}</BreadcrumbLink>
              </Link>
            </BreadcrumbItem>

            <BreadcrumbItem isCurrentPage>
              <BreadcrumbLink>{companyInfo ? companyInfo.facilityName : '詳細資料'}</BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>

          <Heading mt={4} color="green.600">{companyInfo ? companyInfo.name : '公司名稱載入中...'}</Heading>
          <Text fontSize="lg" color="gray.600">{companyInfo ? companyInfo.englishName : ''}</Text>
        </Container>
      </Box>

      <Container maxW="container.xl" py={10}>
        {/* Company Basic Info */}
        {companyInfo && (
          <VStack spacing={8} align="stretch" mb={10}>
            {companyInfo.logoUrl && (
              <Card variant="outline" borderWidth="1px" borderColor="gray.200" borderRadius="md">
                <CardBody display="flex" justifyContent="center" alignItems="center" bg="white" py={6}>
                  <Image
                    src={companyInfo.logoUrl}
                    alt={companyInfo.name}
                    maxH="120px"
                    maxW="400px"
                    objectFit="contain"
                  />
                </CardBody>
              </Card>
            )}
            <Heading size="lg" color="green.600">公司基本資訊</Heading>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              <Card variant="outline" borderWidth="1px" borderColor="gray.200" borderRadius="md">
                <CardBody>
                  <VStack align="start" spacing={4}>
                    <Heading size="md" color="green.600" mb={2}><Icon as={FaBuilding} mr={2} />基本資訊</Heading>
                    <Divider />
                    {Object.entries({
                      "公司名稱": companyInfo.name,
                      "公司代號": companyInfo.companyCode,
                      "公司類型": companyInfo.companyType,
                      "董事長": companyInfo.chairman,
                      "地址": companyInfo.address,
                      "產業": companyInfo.industry,
                      "成立日期": companyInfo.foundedDate,
                      "上市日期": companyInfo.listedDate,
                      "資本額": companyInfo.capital !== 'N/A' ? `NT$ ${parseInt(companyInfo.capital).toLocaleString()}` : 'N/A',
                    }).map(([key, value]) => (
                      <HStack key={key} width="100%" justifyContent="space-between">
                        <Text fontWeight="bold" color="gray.600">{key}:</Text>
                        <Text color="gray.800" textAlign="right">{value || 'N/A'}</Text>
                      </HStack>
                    ))}
                  </VStack>
                </CardBody>
              </Card>

              <Card variant="outline" borderWidth="1px" borderColor="gray.200" borderRadius="md">
                <CardBody>
                  <VStack align="start" spacing={4}>
                    <Heading size="md" color="green.600" mb={2}><Icon as={FaNewspaper} mr={2} />統計資訊</Heading>
                    <Divider />
                     {Object.entries({
                      "總廠區數": companyInfo.totalFacilities,
                      "總違規數": companyInfo.totalViolations,
                      "官方網站": companyInfo.reportUrl && companyInfo.reportUrl !== 'N/A' ? (
                        <ChakraLink href={companyInfo.reportUrl} isExternal color="teal.500">
                          查看網站 <Icon as={FaExternalLinkAlt} mx="2px" />
                        </ChakraLink>
                      ) : 'N/A',
                    }).map(([key, value]) => (
                      <HStack key={key} width="100%" justifyContent="space-between">
                        <Text fontWeight="bold" color="gray.600">{key}:</Text>
                        <Box textAlign="right">{typeof value === 'string' || typeof value === 'number' ? value : value || 'N/A'}</Box>
                      </HStack>
                    ))}
                  </VStack>
                </CardBody>
              </Card>
            </SimpleGrid>
          </VStack>
        )}

        {/* Facilities List */}
        <VStack spacing={6} align="stretch" mb={10}>
          <Heading size="lg" color="green.600">廠區列表</Heading>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {companyData.facilities?.map(facility => (
              <FacilityCard key={facility.facilityId} facility={facility} companyId={companyData.id} />
            ))}
          </SimpleGrid>
        </VStack>

        {/* Tabs for News and Violations */}
        <Tabs variant="enclosed-colored" colorScheme="green" isFitted>
          <TabList mb="1em">
            <Tab>相關新聞</Tab>
            <Tab>環境違規記錄</Tab>
          </TabList>

          <TabPanels>

            {/* 相關新聞 Tab */}
            <TabPanel>
              <VStack align="stretch" spacing={4}>
                <HStack>
                  <Icon as={FaFilter} />
                  <Text fontWeight="bold">篩選廠區:</Text>
                  <Menu>
                    <MenuButton 
                      as={Button} 
                      rightIcon={<FaChevronDown />} 
                      variant="outline" 
                      size="sm" 
                      minWidth="200px" 
                      textAlign="left"
                    >
                      <Flex justify="space-between" align="center" width="100%">
                        {getSelectedPlantLabel(selectedNewsPlant)}
                      </Flex>
                    </MenuButton>
                    <MenuList zIndex={10}>
                      {plantSiteOptions.map(option => (
                        <MenuItem 
                          key={option.value} 
                          onClick={() => setSelectedNewsPlant(option.value)}
                          icon={selectedNewsPlant === option.value ? <FaCheck /> : undefined}
                        >
                          {option.label}
                        </MenuItem>
                      ))}
                    </MenuList>
                  </Menu>
                </HStack>
                <Heading size="md" color="green.600" mt={2}>國際新聞</Heading>
                {filteredNews.international.length > 0 ? (
                  filteredNews.international.map((newsItem, index) => (
                    <Card key={`intl-${index}`} variant="outline" size="sm">
                      <CardBody>
                        <Heading size="sm" mb={1}>{newsItem.title}</Heading>
                        <HStack justifyContent="space-between" color="gray.500" fontSize="sm">
                          <Text><Icon as={FaCalendarAlt} mr={1} /> {newsItem.date} - {newsItem.source}</Text>
                          {newsItem.plantSite && <Text>廠區: {newsItem.plantSite}</Text>}
                        </HStack>
                         <ChakraLink href={newsItem.url || '#'} isExternal color="teal.500" fontSize="sm" mt={1} display="block">
                          閱讀更多 <Icon as={FaExternalLinkAlt} mx="2px" />
                        </ChakraLink>
                      </CardBody>
                    </Card>
                  ))
                ) : (
                  <Text>此廠區無相關國際新聞。</Text>
                )}
                <Heading size="md" color="green.600" mt={4}>國內新聞</Heading>
                 {filteredNews.domestic.length > 0 ? (
                  filteredNews.domestic.map((newsItem, index) => (
                     <Card key={`dom-${index}`} variant="outline" size="sm">
                      <CardBody>
                        <Heading size="sm" mb={1}>{newsItem.title}</Heading>
                         <HStack justifyContent="space-between" color="gray.500" fontSize="sm">
                          <Text><Icon as={FaCalendarAlt} mr={1} /> {newsItem.date} - {newsItem.source}</Text>
                          {newsItem.plantSite && <Text>廠區: {newsItem.plantSite}</Text>}
                        </HStack>
                        <ChakraLink href={newsItem.url || '#'} isExternal color="teal.500" fontSize="sm" mt={1} display="block">
                          閱讀更多 <Icon as={FaExternalLinkAlt} mx="2px" />
                        </ChakraLink>
                      </CardBody>
                    </Card>
                  ))
                ) : (
                  <Text>此廠區無相關國內新聞。</Text>
                )}
              </VStack>
            </TabPanel>

            {/* 環境違規記錄 Tab */}
            <TabPanel>
              <VStack align="stretch" spacing={4}>
                <HStack>
                  <Icon as={FaFilter} />
                  <Text fontWeight="bold">篩選廠區:</Text>
                  <Menu>
                    <MenuButton 
                      as={Button} 
                      rightIcon={<FaChevronDown />} 
                      variant="outline" 
                      size="sm" 
                      minWidth="200px" 
                      textAlign="left"
                    >
                       <Flex justify="space-between" align="center" width="100%">
                        {getSelectedPlantLabel(selectedViolationPlant)}
                      </Flex>
                    </MenuButton>
                    <MenuList zIndex={10}> 
                      {plantSiteOptions.map(option => (
                        <MenuItem 
                          key={option.value} 
                          onClick={() => setSelectedViolationPlant(option.value)}
                          icon={selectedViolationPlant === option.value ? <FaCheck /> : undefined}
                        >
                          {option.label}
                        </MenuItem>
                      ))}
                    </MenuList>
                  </Menu>
                </HStack>
                {filteredViolations.length > 0 ? (
                  <Box borderWidth="1px" borderRadius="lg" overflowX="auto">
                    <Table variant="simple" size="sm">
                      <Thead bg="gray.100">
                        <Tr>
                          <Th>案件編號</Th>
                          <Th>發生日期</Th>
                          <Th>監測期結束</Th>
                          <Th>接收日期</Th>
                          <Th>類型</Th>
                          <Th>違規代碼</Th>
                          <Th>描述</Th>
                          <Th>備註</Th>
                          <Th>狀態</Th>
                          <Th>來源</Th>
                          <Th>廠區</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {filteredViolations.map((violation, index) => (
                          <Tr key={index}>
                            <Td>{violation.caseNumber || 'N/A'}</Td>
                            <Td whiteSpace="nowrap">{violation.date || 'N/A'}</Td>
                            <Td whiteSpace="nowrap">{violation.monitoringPeriodEndDate || 'N/A'}</Td>
                            <Td whiteSpace="nowrap">{violation.valueReceivedDate || 'N/A'}</Td>
                            <Td>
                              <Badge colorScheme={getViolationTypeColor(violation.type)} fontSize="0.8em" whiteSpace="normal">
                                {violation.type || 'N/A'}
                              </Badge>
                            </Td>
                            <Td>{violation.violationCode || 'N/A'}</Td>
                            <Td maxW="300px">{violation.description || 'N/A'}</Td>
                            <Td maxW="200px">{violation.comment || 'N/A'}</Td>
                            <Td>
                              <Badge colorScheme={getViolationStatusColor(violation.status)} fontSize="0.8em">
                                {violation.status || 'N/A'}
                              </Badge>
                            </Td>
                            <Td>{violation.source || 'N/A'}</Td>
                            <Td>{violation.plantSite || 'N/A'}</Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </Box>
                ) : (
                  <Text>此廠區無相關違規記錄。</Text>
                )}
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Container>
    </Layout>
  );
};

export default CompanyDetail;

// getStaticPaths - 生成所有公司頁面路徑
export async function getStaticPaths() {
  const companyIds = getAllCompanyIds();

  const paths = companyIds.map(id => ({
    params: { id }
  }));

  return {
    paths,
    fallback: false
  };
}

// getStaticProps - 載入特定公司資料
export async function getStaticProps({ params }) {
  const companyData = getCompanyData(params.id);

  return {
    props: {
      companyData
    }
  };
} 