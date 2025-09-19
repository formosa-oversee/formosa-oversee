import { Box, Container, Heading, Text, Button, Stack, Flex, SimpleGrid, Icon, Image } from '@chakra-ui/react';
import Link from 'next/link';
import Layout from '../components/Layout';
import { FaSearchLocation, FaChartLine, FaClipboardCheck } from 'react-icons/fa';

// 特色功能卡片組件
const FeatureCard = ({ icon, title, description }) => {
  return (
    <Box bg="white" p={6} rounded="lg" shadow="md" borderWidth="1px" 
         borderColor="gray.100" transition="all 0.3s" 
         _hover={{ transform: 'translateY(-5px)', shadow: 'lg' }}>
      <Flex direction="column" align="center" textAlign="center">
        <Icon as={icon} boxSize={12} color="green.500" mb={4} />
        <Heading as="h3" size="md" mb={2} color="green.600">
          {title}
        </Heading>
        <Text color="gray.600">{description}</Text>
      </Flex>
    </Box>
  );
};

export default function Home() {
  return (
    <Layout>
      {/* 主要橫幅 */}
      <Box bg="green.50" py={20}>
        <Container maxW="container.xl">
          <Stack spacing={8} textAlign="center">
            <Heading as="h1" size="2xl" color="green.600">
              GreenWatchAI
            </Heading>
            <Text fontSize="xl" color="green.700">
              企業環境監測平台
            </Text>
            <Text fontSize="lg" maxW="container.md" mx="auto" color="gray.600">
              透過數據分析和人工智能，我們追蹤企業的環境表現和違規記錄，
              為投資者、消費者和公眾提供透明、可靠的環境信息。
            </Text>
            <Box>
              <Link href="/companies" legacyBehavior>
                <Button as="a" colorScheme="green" size="lg" px={8}>
                  查看企業列表
                </Button>
              </Link>
            </Box>
          </Stack>
        </Container>
      </Box>

      {/* 特色功能區塊 */}
      <Box py={16}>
        <Container maxW="container.xl">
          <Heading as="h2" size="xl" mb={10} textAlign="center" color="green.600">
            平台特色
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10}>
            <FeatureCard 
              icon={FaSearchLocation} 
              title="企業環境監測" 
              description="實時追蹤企業環境表現，獲取EPA違規數據和環境合規狀況"
            />
            <FeatureCard 
              icon={FaChartLine} 
              title="ESG分析報告" 
              description="全面的環境、社會和治理數據分析，幫助評估企業永續發展表現"
            />
            <FeatureCard 
              icon={FaClipboardCheck} 
              title="違規記錄追蹤" 
              description="詳細記錄企業環保違規事件，包括罰款金額、違規類型和處理狀態"
            />
          </SimpleGrid>
        </Container>
      </Box>

      {/* 關於平台區塊 */}
      <Box bg="gray.50" py={16}>
        <Container maxW="container.xl">
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10} alignItems="center">
            <Box>
              <Heading as="h2" size="xl" mb={4} color="green.600">
                關於我們的平台
              </Heading>
              <Text fontSize="lg" color="gray.600" mb={4}>
                GreenWatchAI 致力於提高企業環境責任的透明度，我們匯集來自EPA、公共記錄和企業報告的數據，
                提供全面的企業環境表現分析。
              </Text>
              <Text fontSize="lg" color="gray.600">
                我們的目標是幫助投資者做出負責任的投資決策，幫助消費者了解他們所支持企業的環境影響，
                並促進企業增加環境責任感。
              </Text>
            </Box>
            <Flex justifyContent="center">
              <Box maxW="400px" w="full" h="300px" bg="gray.200" rounded="md" overflow="hidden">
                {/* 這裡可以放置一張圖片 */}
              </Box>
            </Flex>
          </SimpleGrid>
        </Container>
      </Box>
    </Layout>
  );
} 