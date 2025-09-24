import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Row, Col, Card, Typography, Spin, Divider } from "antd";
import { toast } from "react-toastify";
import ImageUpload from "../components/ImageUpload";

const { Title, Text } = Typography;

const dresses = [
  {
    id: "1",
    name: "Dress 1",
    image: "/ProductImages/1.png",
    type: "Shirt",
    style: "formal",
  },
  {
    id: "2",
    name: "Dress 2",
    image: "/ProductImages/2.jpg",
    type: "T-Shirt",
    style: "T-Shirt",
  },
  {
    id: "3",
    name: "Dress 3",
    image: "/ProductImages/3.jpg",
    type: "top",
    style: "casual",
  },
  // Add more as needed
];

function Catalogue() {
  const [personImage, setPersonImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const resultRef = useRef(null);

  useEffect(() => {
    if (result && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [result]);

  const handleTryOn = async (dress) => {
    if (!personImage) {
      toast.error("Please upload your photo first.");
      return;
    }

    setLoading(true);

    try {
      const clothUrl = `${window.location.origin}${dress.image}`;
      const clothResponse = await fetch(clothUrl);
      const clothBlob = await clothResponse.blob();

      const clothFile = new File([clothBlob], `${dress.name}.jpg`, {
        type: clothBlob.type,
      });

      const formData = new FormData();
      formData.append("person_image", personImage);
      formData.append("cloth_image", clothFile);
      formData.append("garment_type", dress.type);
      formData.append("style", dress.style);

      const res = await axios.post(
        "http://127.0.0.1:8080/api/try-on",
        formData
      );
      setResult({
        image: res.data.image,
        text: res.data.text,
      });
      toast.success("Try-on generated!");
    } catch (err) {
      toast.error("Failed to generate try-on.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <Title level={2} style={{ textAlign: "center", marginBottom: "2rem" }}>
        Dress Catalogue
      </Title>

      {/* Upload and Result Side-by-Side */}
      <Row gutter={[32, 32]} style={{ marginBottom: "3rem" }}>
        {/* Left: Upload */}
        <Col xs={24} md={12}>
          <div
            style={{ padding: "1rem", background: "#f9f9f9", borderRadius: 12 }}
          >
            <Title level={4}>Upload Your Photo</Title>
            <ImageUpload
              label="Upload Selfie"
              onImageChange={setPersonImage}
              isDarkMode={false}
            />
          </div>
        </Col>

        {/* Right: Result */}
        {/* Right: Result */}
        <Col xs={24} md={12}>
          {result ? (
            <div ref={resultRef} style={{ textAlign: "center" }}>
              <Title level={4}>Your Try-On Result</Title>
              <img
                src={result.image}
                alt="Try-On Result"
                style={{
                  width: "100%",
                  maxHeight: 300,
                  objectFit: "contain",
                  borderRadius: 16,
                  backgroundColor: "#f0f0f0",
                  boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
                }}
              />
              {/* <Text style={{ display: "block", marginTop: 16, fontSize: "1.2rem" }}>
        {result.text}
      </Text> */}
            </div>
          ) : (
            <div
              style={{ textAlign: "center", paddingTop: "3rem", color: "#999" }}
            >
              <Text type="secondary">
                Your result will appear here after selection
              </Text>
            </div>
          )}
        </Col>
      </Row>

      {/* Dress Grid */}
      <Row gutter={[24, 24]}>
        {dresses.map((dress) => (
          <Col xs={24} sm={12} md={8} key={dress.id}>
            <Card
              hoverable
              cover={
                <img
                  src={dress.image}
                  alt={dress.name}
                  style={{
                    width: "100%",
                    maxHeight: 300,
                    objectFit: "contain",
                    borderRadius: "12px 12px 0 0",
                    backgroundColor: "#f0f0f0",
                  }}
                />
              }
              onClick={() => handleTryOn(dress)}
            >
              <Title level={4}>{dress.name}</Title>
              <Text type="secondary">
                {dress.style} • {dress.type}
              </Text>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Loading Spinner */}
      {loading && (
        <div style={{ textAlign: "center", marginTop: "3rem" }}>
          <Spin size="large" />
        </div>
      )}
    </div>
  );
}

export default Catalogue;
