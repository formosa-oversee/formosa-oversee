import { useState } from 'react';
import { Box, Container, Heading, Text, Grid, GridItem, VStack, HStack, Badge, Card, CardBody, Stack, Divider, CardFooter, Button, Image, Input, InputGroup, InputLeftElement, Flex } from '@chakra-ui/react';
import { FaSearch, FaIndustry, FaBuilding, FaChevronRight } from 'react-icons/fa';
import Link from 'next/link';
import Layout from '../../components/Layout';


const CompanyCard = ({ company }) => {
  return (
    <Link href={`/companies/${company.id}`} legacyBehavior>
      <Card boxShadow="md" borderRadius="lg" h="100%" cursor="pointer" _hover={{ boxShadow: "xl" }}>
        <CardBody>
          <Image
            src={company.logoUrl || `https://via.placeholder.com/300x150?text=${encodeURIComponent(company.name)}`}
            alt={company.name}
            borderRadius="lg"
            height="150px"
            width="100%"
            objectFit="contain"
            bg="white"
            p={4}
          />
          <Stack mt="6" spacing="3">
            <Heading size="md">{company.name}</Heading>
            <Text color="gray.600" fontSize="sm">{company.englishName}</Text>
            <HStack>
              <FaIndustry />
              <Text color="gray.600">{company.industry}</Text>
            </HStack>
            <Text color="gray.600">廠區數量: {company.facilities.length}</Text>
            <Text color="gray.600">違規記錄: {company.totalViolations}</Text>
          </Stack>
        </CardBody>
        <Divider />
        <CardFooter>
          <Button colorScheme="green" w="100%" rightIcon={<FaChevronRight />}>
            查看詳情
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default function Companies({ companiesData: initialCompaniesData = [] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [companiesData] = useState(initialCompaniesData);
  const [filteredCompanies, setFilteredCompanies] = useState(initialCompaniesData);

  // Debug: Log data on mount
  if (typeof window !== 'undefined' && initialCompaniesData.length > 0) {
    console.log('Companies loaded:', initialCompaniesData.length);
  }

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
          facility.name?.toLowerCase().includes(term.toLowerCase()) ||
          facility.city?.toLowerCase().includes(term.toLowerCase()) ||
          facility.state?.toLowerCase().includes(term.toLowerCase()) ||
          facility.country?.toLowerCase().includes(term.toLowerCase())
        )
      );
      setFilteredCompanies(filtered);
    }
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

          <Grid templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={6}>
            {filteredCompanies.map(company => (
              <GridItem key={company.id}>
                <CompanyCard company={company} />
              </GridItem>
            ))}
          </Grid>

          {filteredCompanies.length === 0 && (
            <Box textAlign="center" py={10} bg="white" rounded="md" shadow="sm" p={6}>
              <Text fontSize="lg">沒有找到符合的企業，請嘗試其他搜索詞</Text>
            </Box>
          )}
        </VStack>
      </Container>
    </Layout>
  );
}

// getStaticProps - 在 build 時載入資料
export async function getStaticProps() {
  // Import server-side only modules here
  const { getAllCompanies, getCompanyFacilities } = await import('../../lib/gcs-api-server');

  try {
    const allCompanies = getAllCompanies();

    // Transform GCS data to match UI structure
    const transformedData = allCompanies.map(company => {
      const facilities = getCompanyFacilities(company.id);

      return {
        id: company.id,
        name: company.name,
        englishName: company.englishName,
        industry: company.industry || 'N/A',
        logoUrl: company.logoUrl || null,
        facilities: facilities,
        totalViolations: company.violationCount,
        totalFacilities: company.facilityCount
      };
    });

    console.log(`[getStaticProps] Loaded ${transformedData.length} companies`);

    return {
      props: {
        companiesData: transformedData
      }
    };
  } catch (error) {
    console.error('[getStaticProps] Error:', error);
    return {
      props: {
        companiesData: []
      }
    };
  }
} 