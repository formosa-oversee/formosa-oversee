import { Box, Flex, Container, Heading, Text, HStack, Link as ChakraLink, Button, VStack, Icon } from '@chakra-ui/react';
import { FaLeaf, FaGithub, FaLinkedin } from 'react-icons/fa';
import Link from 'next/link';

// 導航欄組件
const Navbar = () => {
  return (
    <Box as="nav" bg="green.50" py={4} boxShadow="sm">
      <Container maxW="container.xl">
        <Flex justifyContent="space-between" alignItems="center">
          <Link href="/" legacyBehavior>
            <Flex as="a" alignItems="center" cursor="pointer">
              <Icon as={FaLeaf} color="green.500" boxSize={6} mr={2} />
              <Heading as="h1" size="lg" color="green.600">Formosa Oversee</Heading>
            </Flex>
          </Link>
          <HStack spacing={6}>
            <Link href="/companies" legacyBehavior>
              <Button as="a" variant="ghost" colorScheme="green">企業列表</Button>
            </Link>
            <Button variant="ghost" colorScheme="green">關於我們</Button>
          </HStack>
        </Flex>
      </Container>
    </Box>
  );
};

// 頁尾組件
const Footer = () => {
  return (
    <Box as="footer" bg="gray.50" pt={10} pb={6} mt="auto">
      <Container maxW="container.xl">
        <VStack spacing={6}>
          <Flex w="100%" justifyContent="space-between" flexDir={{ base: 'column', md: 'row' }} gap={4}>
            <Box>
              <Heading size="md" mb={4} color="green.600">Formosa Oversee</Heading>
              <Text color="gray.600">企業環境監測平台</Text>
              <Text color="gray.600" maxW="md" mt={2}>
                幫助投資者、消費者和公眾了解企業的環境表現和違規記錄
              </Text>
            </Box>
            <Box>
              <Heading size="sm" mb={4} color="green.600">聯絡我們</Heading>
              <Text color="gray.600">Email: contact@formosa-oversee.org</Text>
              <HStack mt={4} spacing={4}>
                <ChakraLink href="#" isExternal>
                  <Icon as={FaGithub} boxSize={5} color="gray.600" />
                </ChakraLink>
                <ChakraLink href="#" isExternal>
                  <Icon as={FaLinkedin} boxSize={5} color="gray.600" />
                </ChakraLink>
              </HStack>
            </Box>
          </Flex>
          <Box w="100%" borderTopWidth={1} borderColor="gray.200" pt={6}>
            <Text color="gray.500" fontSize="sm" textAlign="center">
              © {new Date().getFullYear()} Formosa Oversee. 版權所有。
            </Text>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
};

// 佈局組件
const Layout = ({ children }) => {
  return (
    <Flex direction="column" minH="100vh">
      <Navbar />
      <Box flex="1">
        {children}
      </Box>
      <Footer />
    </Flex>
  );
};

export default Layout; 