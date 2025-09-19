import { useState } from 'react';
import { Box, Container, Heading, Text, Grid, GridItem, VStack, HStack, Badge, Card, CardBody, Stack, Divider, CardFooter, Button, Image, Input, InputGroup, InputLeftElement, Flex } from '@chakra-ui/react';
import { FaSearch, FaIndustry, FaBuilding, FaChevronRight } from 'react-icons/fa';
import Link from 'next/link';
import Layout from '../../components/Layout';

// 重新組織企業數據，將公司和廠區分開
const companiesData = [
  {
    id: 'formosa-plastics',
    name: '台塑塑膠工業股份有限公司',
    englishName: 'Formosa Plastics Corporation',
    industry: '塑膠製造',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR6p9BrOMzuRo0kbRHIqkREHulpJqJ01JRTPQ&s',
    facilities: [
      {
        id: 'formosa-plastics-tx',
        name: '德州廠',
        englishName: 'Texas Plant',
        location: '美國, 德州',
        riskLevel: 'high',
        recentViolations: 5,
      },
      {
        id: 'formosa-plastics-tw',
        name: '台灣廠',
        englishName: 'Taiwan Plant',
        location: '台灣, 雲林',
        riskLevel: 'medium',
        recentViolations: 2,
      }
    ]
  },
  {
    id: 'nan-ya-plastics',
    name: '南亞塑膠工業股份有限公司',
    englishName: 'Nan Ya Plastics Corporation',
    industry: '塑膠製造',
    image: 'https://www.npc.com.tw/j2npc/images/public/pic/location_06.jpg',
    facilities: [
      {
        id: 'nan-ya-plastics',
        name: '高雄廠',
        englishName: 'Kaohsiung Plant',
        location: '台灣, 高雄',
        riskLevel: 'medium',
        recentViolations: 3,
      }
    ]
  },
  {
    id: 'evergreen-marine',
    name: '長榮海運股份有限公司',
    englishName: 'Evergreen Marine Corp.',
    industry: '航運業',
    image: 'https://images.ctee.com.tw/newsphoto/2024-08-13/1024/20240813701678.jpg',
    facilities: [
      {
        id: 'evergreen-marine',
        name: '台北總部',
        englishName: 'Taipei Headquarters',
        location: '台灣, 台北',
        riskLevel: 'low',
        recentViolations: 1,
      }
    ]
  },
  {
    id: 'china-steel',
    name: '中國鋼鐵股份有限公司',
    englishName: 'China Steel Corporation',
    industry: '鋼鐵製造',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRJdtuDYf03lUt5YMqHCLT5rliSnFgF95E9KQ&s',
    facilities: [
      {
        id: 'china-steel',
        name: '高雄廠',
        englishName: 'Kaohsiung Plant',
        location: '台灣, 高雄',
        riskLevel: 'high',
        recentViolations: 4,
      }
    ]
  },
  {
    id: 'hon-hai-precision',
    name: '鴻海精密工業股份有限公司',
    englishName: 'Hon Hai Precision Industry Co., Ltd.',
    industry: '電子製造服務',
    image: 'https://pgw.udn.com.tw/gw/photo.php?u=https://uc.udn.com.tw/photo/2024/08/21/2/30310181.jpg&x=0&y=0&sw=0&sh=0&sl=W&fw=800&exp=3600&w=930&nt=1',
    facilities: [
      {
        id: 'foxconn-tucheng',
        name: '土城總部',
        englishName: 'Tucheng Headquarters',
        location: '台灣, 新北',
        riskLevel: 'low',
        recentViolations: 1,
      },
      {
        id: 'foxconn-shenzhen',
        name: '深圳龍華廠',
        englishName: 'Shenzhen Longhua Plant',
        location: '中國, 深圳',
        riskLevel: 'high',
        recentViolations: 3,
      },
      {
        id: 'foxconn-zhengzhou',
        name: '鄭州廠',
        englishName: 'Zhengzhou Plant',
        location: '中國, 鄭州',
        riskLevel: 'medium',
        recentViolations: 1,
      },
      {
        id: 'foxconn-taiyuan',
        name: '太原廠',
        englishName: 'Taiyuan Plant',
        location: '中國, 太原',
        riskLevel: 'high',
        recentViolations: 2,
      },
      {
        id: 'foxconn-wisconsin',
        name: '威斯康辛廠',
        englishName: 'Wisconsin Plant',
        location: '美國, 威斯康辛',
        riskLevel: 'medium',
        recentViolations: 2,
      },
      {
        id: 'foxconn-ohio',
        name: '俄亥俄廠',
        englishName: 'Ohio Plant',
        location: '美國, 俄亥俄',
        riskLevel: 'low',
        recentViolations: 1,
      }
    ]
  },
  {
    id: 'tsmc',
    name: '台灣積體電路製造股份有限公司',
    englishName: 'Taiwan Semiconductor Manufacturing Company Limited',
    industry: '半導體製造',
    image: 'https://ibw.bwnet.com.tw/ac_gallery/2025/02/a42bbe0f-0575-ceba-4fb3-e73942a58f6c_800.webp',
    facilities: [
      {
        id: 'tsmc-hsinchu',
        name: '新竹廠',
        englishName: 'Hsinchu Fab',
        location: '台灣, 新竹',
        riskLevel: 'medium',
        recentViolations: 3,
      },
      {
        id: 'tsmc-tainan',
        name: '台南廠',
        englishName: 'Tainan Fab',
        location: '台灣, 台南',
        riskLevel: 'low',
        recentViolations: 1,
      },
      {
        id: 'tsmc-taichung',
        name: '台中廠',
        englishName: 'Taichung Fab',
        location: '台灣, 台中',
        riskLevel: 'low',
        recentViolations: 1,
      },
      {
        id: 'tsmc-kaohsiung',
        name: '高雄廠',
        englishName: 'Kaohsiung Fab',
        location: '台灣, 高雄',
        riskLevel: 'medium',
        recentViolations: 1,
      },
      {
        id: 'tsmc-arizona',
        name: '亞利桑那廠',
        englishName: 'Arizona Fab',
        location: '美國, 亞利桑那',
        riskLevel: 'high',
        recentViolations: 2,
      },
      {
        id: 'tsmc-nanjing',
        name: '南京廠',
        englishName: 'Nanjing Fab',
        location: '中國, 南京',
        riskLevel: 'low',
        recentViolations: 1,
      }
    ]
  }
];

const CompanyCard = ({ company, onClick }) => {
  return (
    <Card boxShadow="md" borderRadius="lg" h="100%" onClick={onClick} cursor="pointer">
      <CardBody>
        <Image
          src={company.image}
          alt={company.name}
          borderRadius="lg"
          height="150px"
          width="100%"
          objectFit="cover"
        />
        <Stack mt="6" spacing="3">
          <Heading size="md">{company.name}</Heading>
          <Text color="gray.600" fontSize="sm">{company.englishName}</Text>
          <HStack>
            <FaIndustry />
            <Text color="gray.600">{company.industry}</Text>
          </HStack>
          <Text color="gray.600">廠區數量: {company.facilities.length}</Text>
        </Stack>
      </CardBody>
      <Divider />
      <CardFooter>
        <Button colorScheme="green" w="100%" rightIcon={<FaChevronRight />}>
          查看廠區
        </Button>
      </CardFooter>
    </Card>
  );
};

const FacilityCard = ({ facility, companyName }) => {
  const getRiskColor = (risk) => {
    switch (risk) {
      case 'high': return 'red';
      case 'medium': return 'orange';
      case 'low': return 'green';
      default: return 'gray';
    }
  };

  const getRiskText = (risk) => {
    switch (risk) {
      case 'high': return '高風險';
      case 'medium': return '中風險';
      case 'low': return '低風險';
      default: return '未評估';
    }
  };

  return (
    <Card boxShadow="md" borderRadius="lg" h="100%">
      <CardBody>
        <Stack mt="3" spacing="3">
          <Heading size="md">{companyName}</Heading>
          <Heading size="sm" color="gray.600">{facility.name}</Heading>
          <Text color="gray.600" fontSize="sm">{facility.englishName}</Text>
          <HStack>
            <FaBuilding />
            <Text color="gray.600">{facility.location}</Text>
          </HStack>
          <HStack>
            <Badge colorScheme={getRiskColor(facility.riskLevel)} px={2} py={1} borderRadius="full">
              {getRiskText(facility.riskLevel)}
            </Badge>
            {facility.recentViolations > 0 && (
              <Badge colorScheme="red" px={2} py={1} borderRadius="full">
                近期違規: {facility.recentViolations}
              </Badge>
            )}
          </HStack>
        </Stack>
      </CardBody>
      <Divider />
      <CardFooter>
        <Link href={`/companies/${facility.id}`} legacyBehavior>
          <Button as="a" colorScheme="green" w="100%">
            查看詳情
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default function Companies() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [filteredCompanies, setFilteredCompanies] = useState(companiesData);

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    
    if (term.trim() === '') {
      setFilteredCompanies(companiesData);
    } else {
      const filtered = companiesData.filter(company => 
        company.name.toLowerCase().includes(term.toLowerCase()) ||
        company.englishName.toLowerCase().includes(term.toLowerCase()) ||
        company.industry.toLowerCase().includes(term.toLowerCase()) ||
        company.facilities.some(facility => 
          facility.location.toLowerCase().includes(term.toLowerCase())
        )
      );
      setFilteredCompanies(filtered);
    }
  };

  const handleCompanySelect = (company) => {
    setSelectedCompany(company);
  };

  const handleBackToCompanies = () => {
    setSelectedCompany(null);
  };

  return (
    <Layout>
      <Box bg="green.50" py={6}>
        <Container maxW="container.xl">
          <Heading color="green.600">企業環境監測列表</Heading>
          <Text color="gray.600" mt={2}>
            瀏覽和搜索企業的環境表現、違規記錄和ESG評級
          </Text>
        </Container>
      </Box>
      
      <Container maxW="container.xl" py={10}>
        <VStack spacing={8} align="stretch">
          <Box mb={6}>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <FaSearch color="gray.300" />
              </InputLeftElement>
              <Input 
                placeholder="搜索企業名稱、行業或地區" 
                value={searchTerm}
                onChange={handleSearch}
                borderRadius="md"
                bg="white"
              />
            </InputGroup>
          </Box>

          {selectedCompany ? (
            <>
              <Flex justifyContent="space-between" alignItems="center" mb={4}>
                <Heading size="md">
                  {selectedCompany.name} - 廠區列表
                </Heading>
                <Button 
                  onClick={handleBackToCompanies} 
                  variant="outline" 
                  colorScheme="green"
                  leftIcon={<FaChevronRight transform="rotate(180deg)" />}
                >
                  返回公司列表
                </Button>
              </Flex>
              <Grid templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={6}>
                {selectedCompany.facilities.map(facility => (
                  <GridItem key={facility.id}>
                    <FacilityCard facility={facility} companyName={selectedCompany.name} />
                  </GridItem>
                ))}
              </Grid>
            </>
          ) : (
            <Grid templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={6}>
              {filteredCompanies.map(company => (
                <GridItem key={company.id}>
                  <CompanyCard company={company} onClick={() => handleCompanySelect(company)} />
                </GridItem>
              ))}
            </Grid>
          )}
          
          {filteredCompanies.length === 0 && !selectedCompany && (
            <Box textAlign="center" py={10} bg="white" rounded="md" shadow="sm" p={6}>
              <Text fontSize="lg">沒有找到符合的企業，請嘗試其他搜索詞</Text>
            </Box>
          )}
        </VStack>
      </Container>
    </Layout>
  );
} 