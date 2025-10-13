import { useState, useMemo } from 'react';
import {
  Box, Container, Heading, Text, Tabs, TabList, TabPanels, Tab, TabPanel,
  Table, Thead, Tbody, Tr, Th, Td, Badge, HStack, VStack, Link as ChakraLink,
  SimpleGrid, Card, CardBody, Divider, Icon, Breadcrumb, BreadcrumbItem, BreadcrumbLink,
  Alert, AlertIcon, AlertTitle, AlertDescription, Button
} from '@chakra-ui/react';
import { FaExternalLinkAlt, FaBuilding, FaChevronRight, FaMapMarkerAlt, FaIndustry } from 'react-icons/fa';
import { getCompanyData, getAllCompanyIds } from '../../../../lib/gcs-api-server';
import Layout from '../../../../components/Layout';
import Link from 'next/link';

const FacilityDetail = ({ companyData, facility }) => {
  if (!companyData || !facility) {
    return (
      <Layout>
        <Container maxW="container.xl" py={10}>
          <Alert status="error">
            <AlertIcon />
            <AlertTitle>無法載入廠區資訊！</AlertTitle>
            <AlertDescription>請確認公司ID和廠區ID是否正確。</AlertDescription>
          </Alert>
        </Container>
      </Layout>
    );
  }

  const facilityInfo = {
    facilityId: facility.facilityId,
    name: facility.name,
    registryId: facility.registryId,
    address: facility.address,
    city: facility.city,
    state: facility.state,
    zipCode: facility.zipCode,
    country: facility.country,
    shareholding: facility.shareholding,
    latitude: facility.coordinates?.latitude,
    longitude: facility.coordinates?.longitude,
    programs: facility.programs
  };

  const parentCompany = {
    name: companyData.name,
    englishName: companyData.englishName,
    companyCode: companyData.companyCode,
    website: companyData.website,
    address: companyData.address
  };

  // Filter violations for this facility using facilityId
  const facilityViolations = companyData.violations?.filter(v =>
    v.facilityId === facility.facilityId
  ).map(v => ({
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
    fine: v.fine || 'N/A'
  })) || [];

  const getProgramBadges = () => {
    const programs = [];
    if (facilityInfo.programs?.air) programs.push({ name: '空氣污染監控', color: 'purple' });
    if (facilityInfo.programs?.water) programs.push({ name: '水污染監控', color: 'blue' });
    if (facilityInfo.programs?.waste) programs.push({ name: '廢棄物管理', color: 'orange' });
    if (facilityInfo.programs?.toxics) programs.push({ name: '有毒物質', color: 'red' });
    return programs.length > 0 ? programs : [{ name: '無監控', color: 'gray' }];
  };

  const getViolationTypeColor = (type) => {
    if (!type) return 'gray';
    if (type.toLowerCase().includes('air')) return 'red';
    if (type.toLowerCase().includes('water')) return 'blue';
    if (type.toLowerCase().includes('waste') || type.toLowerCase().includes('rcra')) return 'orange';
    return 'gray';
  };

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
              <Link href={`/companies/${companyData.id}`} legacyBehavior>
                <BreadcrumbLink>{parentCompany.name}</BreadcrumbLink>
              </Link>
            </BreadcrumbItem>

            <BreadcrumbItem isCurrentPage>
              <BreadcrumbLink>{facilityInfo.name}</BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>

          <Heading mt={4} color="green.600">{facilityInfo.name}</Heading>
          <Text fontSize="lg" color="gray.600">{facilityInfo.address}</Text>
        </Container>
      </Box>

      <Container maxW="container.xl" py={10}>
        {/* Facility Basic Info */}
        <VStack spacing={8} align="stretch" mb={10}>
          <Heading size="lg" color="green.600">廠區基本資訊</Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            <Card variant="outline" borderWidth="1px" borderColor="gray.200" borderRadius="md">
              <CardBody>
                <VStack align="start" spacing={4}>
                  <Heading size="md" color="green.600" mb={2}><Icon as={FaBuilding} mr={2} />設施資訊</Heading>
                  <Divider />
                  {Object.entries({
                    "設施名稱": facilityInfo.name,
                    "設施 ID": facilityInfo.facilityId,
                    "登記 ID": facilityInfo.registryId,
                    "地址": facilityInfo.address,
                    "城市": facilityInfo.city,
                    "州/省": facilityInfo.state,
                    "郵遞區號": facilityInfo.zipCode,
                    "國家": facilityInfo.country,
                    "持股比例": facilityInfo.shareholding || 'N/A',
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
                  <Heading size="md" color="green.600" mb={2}><Icon as={FaIndustry} mr={2} />母公司資訊</Heading>
                  <Divider />
                  {Object.entries({
                    "公司名稱": parentCompany.name,
                    "英文名稱": parentCompany.englishName,
                    "公司代號": parentCompany.companyCode,
                    "公司地址": parentCompany.address,
                    "官方網站": parentCompany.website && parentCompany.website !== 'N/A' ? (
                      <ChakraLink href={parentCompany.website} isExternal color="teal.500">
                        查看網站 <Icon as={FaExternalLinkAlt} mx="2px" />
                      </ChakraLink>
                    ) : 'N/A',
                  }).map(([key, value]) => (
                    <HStack key={key} width="100%" justifyContent="space-between">
                      <Text fontWeight="bold" color="gray.600">{key}:</Text>
                      <Box textAlign="right">{typeof value === 'string' ? value : value || 'N/A'}</Box>
                    </HStack>
                  ))}
                  <Link href={`/companies/${companyData.id}`} legacyBehavior>
                    <Button as="a" colorScheme="green" size="sm" w="100%" mt={4}>
                      查看母公司詳情
                    </Button>
                  </Link>
                </VStack>
              </CardBody>
            </Card>
          </SimpleGrid>

          {/* Environmental Programs */}
          <Card variant="outline" borderWidth="1px" borderColor="gray.200" borderRadius="md">
            <CardBody>
              <VStack align="start" spacing={4}>
                <Heading size="md" color="green.600" mb={2}>環境監控項目</Heading>
                <Divider />
                <HStack flexWrap="wrap" gap={3}>
                  {getProgramBadges().map((program, idx) => (
                    <Badge key={idx} colorScheme={program.color} px={3} py={2} borderRadius="md" fontSize="0.9em">
                      {program.name}
                    </Badge>
                  ))}
                </HStack>
              </VStack>
            </CardBody>
          </Card>

          {/* Coordinates */}
          {(facilityInfo.latitude || facilityInfo.longitude) && (
            <Card variant="outline" borderWidth="1px" borderColor="gray.200" borderRadius="md">
              <CardBody>
                <VStack align="start" spacing={4}>
                  <Heading size="md" color="green.600" mb={2}><Icon as={FaMapMarkerAlt} mr={2} />地理位置</Heading>
                  <Divider />
                  <HStack width="100%" justifyContent="space-between">
                    <Text fontWeight="bold" color="gray.600">緯度:</Text>
                    <Text color="gray.800">{facilityInfo.latitude || 'N/A'}</Text>
                  </HStack>
                  <HStack width="100%" justifyContent="space-between">
                    <Text fontWeight="bold" color="gray.600">經度:</Text>
                    <Text color="gray.800">{facilityInfo.longitude || 'N/A'}</Text>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>
          )}
        </VStack>

        {/* Violations Table */}
        <VStack spacing={6} align="stretch">
          <Heading size="lg" color="green.600">環境違規記錄 ({facilityViolations.length})</Heading>
          {facilityViolations.length > 0 ? (
            <Box borderWidth="1px" borderRadius="lg" overflowX="auto">
              <Table variant="simple" size="sm">
                <Thead bg="gray.100">
                  <Tr>
                    <Th>案件編號</Th>
                    <Th>日期</Th>
                    <Th>結束日期</Th>
                    <Th>類型</Th>
                    <Th>違規代碼</Th>
                    <Th>描述</Th>
                    <Th>備註</Th>
                    <Th>狀態</Th>
                    <Th>罰款</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {facilityViolations.map((violation, index) => (
                    <Tr key={index}>
                      <Td>{violation.caseNumber || 'N/A'}</Td>
                      <Td whiteSpace="nowrap">{violation.date || 'N/A'}</Td>
                      <Td whiteSpace="nowrap">{violation.endDate || 'N/A'}</Td>
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
                      <Td>{violation.fine || 'N/A'}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          ) : (
            <Alert status="info">
              <AlertIcon />
              此廠區無相關違規記錄。
            </Alert>
          )}
        </VStack>
      </Container>
    </Layout>
  );
};

export default FacilityDetail;

// getStaticPaths - 生成所有廠區頁面路徑
export async function getStaticPaths() {
  const companyIds = getAllCompanyIds();
  const paths = [];

  companyIds.forEach(companyId => {
    const companyData = getCompanyData(companyId);
    if (companyData && companyData.facilities) {
      companyData.facilities.forEach(facility => {
        paths.push({
          params: {
            id: companyId,
            facilityId: facility.facilityId
          }
        });
      });
    }
  });

  return {
    paths,
    fallback: false
  };
}

// getStaticProps - 載入特定廠區資料
export async function getStaticProps({ params }) {
  const companyData = getCompanyData(params.id);

  if (!companyData) {
    return {
      notFound: true
    };
  }

  const facility = companyData.facilities?.find(f => f.facilityId === params.facilityId);

  if (!facility) {
    return {
      notFound: true
    };
  }

  return {
    props: {
      companyData,
      facility
    }
  };
}
