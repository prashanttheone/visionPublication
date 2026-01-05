"use client";

import Image from "next/image";
import { Row, Col, Button, Typography, Card, Space } from "antd";
import { motion } from "framer-motion";
import { CheckOutlined } from "@ant-design/icons";
import { FaStar } from "react-icons/fa";
import { useRouter } from "next/navigation";


const { Title, Paragraph, Text } = Typography;

export default function Hero() {

const router = useRouter();
  return (
    <section className="relative bg-indigo overflow-hidden px-[20px]">
      <div className="max-w-7xl mx-auto">
        <Row gutter={[48, 48]} align="middle">
          {/* LEFT */}
          <Col xs={24} lg={12}>
            <div style={{ padding: "40px" }}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Title level={1} className="!mb-4 !text-[#fff]">
                  Vision <br />
                  <span className="text-orange-600">Publication</span>
                </Title>

                <Paragraph className="!text-lg !text-[#fff] max-w-xl">
                  Discover excellence in academic and competitive exam books.
                  Quality content crafted by experts to empower your journey.
                </Paragraph>

                <Space size="large" className="mt-6">
                  <Button
                    type="primary"
                    size="large"
                    style={{
                      backgroundColor: "#ea580c", // orange-600
                      borderColor: "#ea580c",
                    }}
                    onClick={() => router.push("/books")}
                  >
                    Buy Books
                  </Button>

                  <Button size="large"
                    onClick={() => router.push("/resources")}
                  >View Resources</Button>
                </Space>

                {/* STATS */}
                <div style={{ padding: "20px" }}>
                  <Row gutter={32}>
                    <Col>
                      <Text strong style={{ fontSize: "40px", color: "#fff" }}>
                        5k+
                      </Text>
                      <div
                        style={{
                          color: "#fff",
                          fontSize: "30px",
                          fontWeight: "bold",
                        }}
                      >
                        Customers
                      </div>
                    </Col>

                    <Col>
                      <Text strong style={{ fontSize: "40px", color: "#fff" }}>
                        1000+
                      </Text>
                      <div
                        style={{
                          color: "#fff",
                          fontSize: "30px",
                          fontWeight: "bold",
                        }}
                      >
                        Products
                      </div>
                    </Col>

                    <Col>
                      <Space>
                        <Text
                          strong
                          style={{ fontSize: "40px", color: "#fff" }}
                        >
                          4.9
                        </Text>
                        <FaStar className="text-yellow-400" />
                      </Space>
                      <div
                        style={{
                          color: "#fff",
                          fontSize: "30px",
                          fontWeight: "bold",
                        }}
                      >
                        Rating
                      </div>
                    </Col>
                  </Row>
                </div>
              </motion.div>
            </div>
          </Col>

          {/* RIGHT */}
          <Col xs={24} lg={12}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7 }}
              className="relative"
            >
              <div className="relative aspect-[16/9] rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src="/HeroBook.jpeg"
                  alt="Vision Publication"
                  fill
                  priority
                  className="object-cover"
                />
              </div>
            </motion.div>
          </Col>
        </Row>
      </div>

      {/* Background Blur */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-100 rounded-full blur-3xl -z-10" />
    </section>
  );
}
