import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import { 
  Box, Container, Heading, Text, Tabs, TabList, TabPanels, Tab, TabPanel, 
  Table, Thead, Tbody, Tr, Th, Td, Badge, HStack, VStack, Link as ChakraLink, 
  SimpleGrid, Card, CardBody, Divider, Stack, Image, Skeleton, Stat, StatLabel, 
  StatNumber, StatHelpText, Icon, Breadcrumb, BreadcrumbItem, BreadcrumbLink,
  Alert, AlertIcon, AlertTitle, AlertDescription,
  Menu, MenuButton, MenuList, MenuItem, Button, Flex
} from '@chakra-ui/react';
import { FaExternalLinkAlt, FaCalendarAlt, FaNewspaper, FaBuilding, FaMoneyBillWave, FaChevronRight, FaFilter, FaChevronDown, FaCheck } from 'react-icons/fa';
import { getCompanyBasicInfo, getViolationData, getRelatedNews } from '../../lib/api';
import Layout from '../../components/Layout';
import Link from 'next/link';

const CompanyDetail = () => {
  const router = useRouter();
  const { id } = router.query;
  
  const [activeTab, setActiveTab] = useState(0);
  const [companyInfo, setCompanyInfo] = useState(null);
  const [violationData, setViolationData] = useState([]);
  const [newsData, setNewsData] = useState({ international: [], domestic: [] });
  const [loading, setLoading] = useState(true);

  // New states for filtering
  const [plantSiteOptions, setPlantSiteOptions] = useState([]);
  const [selectedViolationPlant, setSelectedViolationPlant] = useState('all');
  const [selectedNewsPlant, setSelectedNewsPlant] = useState('all');

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // 獲取基本信息
        const basicInfo = await getCompanyBasicInfo(id);
        setCompanyInfo(basicInfo);

        // 獲取違規數據
        const violations = await getViolationData(id);
        setViolationData(violations);

        // 獲取相關新聞
        const news = await getRelatedNews(id);
        setNewsData(news);

        // Extract plant site options from violations and news
        const violationSites = [...new Set(violations.map(v => v.plantSite).filter(Boolean))];
        const newsSitesDomestic = [...new Set(news.domestic.map(n => n.plantSite).filter(Boolean))];
        const newsSitesInternational = [...new Set(news.international.map(n => n.plantSite).filter(Boolean))];
        const allSites = [...new Set([...violationSites, ...newsSitesDomestic, ...newsSitesInternational])];
        
        const options = [{ value: 'all', label: '所有廠區' }];
        allSites.sort().forEach(site => {
          options.push({ value: site, label: site });
        });
        setPlantSiteOptions(options);

      } catch (error) {
        console.error('Error fetching company data:', error);
        router.push('/companies');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, router]);

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

  if (loading) {
    return (
      <Layout>
        <Container maxW="container.xl" py={10}>
          <VStack spacing={6} align="stretch">
            <Skeleton height="40px" />
            <Skeleton height="50px" />
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10} mt={6}>
              <Skeleton height="300px" />
              <Skeleton height="300px" />
            </SimpleGrid>
            <Skeleton height="200px" mt={6}/>
          </VStack>
        </Container>
      </Layout>
    );
  }
  
  if (!companyInfo) {
     return (
      <Layout>
        <Container maxW="container.xl" py={10}>
          <Alert status="error">
            <AlertIcon />
            <AlertTitle>無法載入公司資訊！</AlertTitle>
            <AlertDescription>請確認公司ID是否正確，或稍後再試。</AlertDescription>
          </Alert>
        </Container>
      </Layout>
    );
  }

  const handleTabChange = (index) => {
    setActiveTab(index);
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
        <Tabs variant="enclosed-colored" colorScheme="green" onChange={handleTabChange} isFitted>
          <TabList mb="1em">
            <Tab>基本ESG資訊</Tab>
            <Tab>相關新聞</Tab>
            <Tab>環境違規記錄</Tab>
          </TabList>

          <TabPanels>
            {/* 基本ESG資訊 Tab */}
            <TabPanel>
              {companyInfo && (
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
                  <Card variant="outline" borderWidth="1px" borderColor="gray.200" borderRadius="md">
                    <CardBody>
                      <VStack align="start" spacing={4}>
                        <Heading size="md" color="green.600" mb={2}><Icon as={FaBuilding} mr={2} />基本資訊</Heading>
                        <Divider />
                        {Object.entries({
                          "公司名稱": companyInfo.name,
                          "設施ID": companyInfo.facilityId,
                          "地址": companyInfo.address,
                          "產業": companyInfo.industry,
                          "員工數": companyInfo.employeeCount,
                          "成立年份": companyInfo.foundedYear,
                          "母公司": companyInfo.parentCompany,
                          "營收": companyInfo.revenue,
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
                        <Heading size="md" color="green.600" mb={2}><Icon as={FaNewspaper} mr={2} />報告與排放</Heading>
                        <Divider />
                         {Object.entries({
                          "碳排放量": companyInfo.carbonEmissions,
                          "ESG報告書": companyInfo.reportUrl ? (
                            <ChakraLink href={companyInfo.reportUrl} isExternal color="teal.500">
                              查看報告 <Icon as={FaExternalLinkAlt} mx="2px" />
                            </ChakraLink>
                          ) : 'N/A',
                        }).map(([key, value]) => (
                          <HStack key={key} width="100%" justifyContent="space-between">
                            <Text fontWeight="bold" color="gray.600">{key}:</Text>
                            <Box textAlign="right">{typeof value === 'string' ? value : value || 'N/A'}</Box>
                          </HStack>
                        ))}
                      </VStack>
                    </CardBody>
                  </Card>
                </SimpleGrid>
              )}
            </TabPanel>

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
                          <Th>日期</Th>
                          <Th>類型</Th>
                          <Th>描述</Th>
                          <Th>狀態</Th>
                          <Th>來源</Th>
                          <Th>廠區</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {filteredViolations.map((violation, index) => (
                          <Tr key={index}>
                            <Td>{violation.caseNumber || 'N/A'}</Td>
                            <Td>{violation.date || 'N/A'}</Td>
                            <Td>
                              <Badge colorScheme={getViolationTypeColor(violation.type)} fontSize="0.8em">
                                {violation.type || 'N/A'}
                              </Badge>
                            </Td>
                            <Td>{violation.description || 'N/A'}</Td>
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