import { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Typography,
  Row,
  Col,
  Select,
  Input,
  Button,
  Divider,
  Spin,
  Card
} from "antd";
import { toast } from "react-toastify";
import ImageUpload from "./ImageUpload";

const { Title, Text } = Typography;
const { Option } = Select;

function MainTryOnForm({ isDarkMode }) {
  const [personImage, setPersonImage] = useState(null);
  const [clothImage, setClothImage] = useState(null);
  const [modelType, setModelType] = useState("");
  const [gender, setGender] = useState("");
  const [garmentType, setGarmentType] = useState("");
  const [style, setStyle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const resultRef = useRef(null);
  const textColor = isDarkMode ? "#e4e4e4" : "#111827";
  const cardColor = isDarkMode ? "#1c1c1c" : "#ffffff";
  const subText = isDarkMode ? "#9ca3af" : "#4b5563";

  useEffect(() => {
    if (result && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [result]);

  const handleTryOn = async () => {
    if (!personImage || !clothImage) {
      toast.error("Please upload both model and garment images.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("person_image", personImage);
    formData.append("cloth_image", clothImage);
    formData.append("model_type", modelType);
    formData.append("gender", gender);
    formData.append("garment_type", garmentType);
    formData.append("style", style);
    formData.append("instructions", instructions);

    try {
      const res = await axios.post("http://127.0.0.1:8080/api/try-on", formData);
      const newResult = {
        id: Date.now(),
        resultImage: res.data.image,
        text: res.data.text,
        timestamp: new Date().toLocaleString(),
      };
      setResult(newResult);
      setHistory((prev) => [newResult, ...prev]);
      toast.success("Try-on completed!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Row gutter={[24, 24]}>
        {/* Model Section */}
        <Col xs={24} md={12}>
          <div style={{ background: cardColor, padding: 24, borderRadius: 12 }}>
            <Title level={4} style={{ color: textColor, marginBottom: 16 }}>
              Model Image
            </Title>
            <ImageUpload
              label="Upload Model Image"
              onImageChange={setPersonImage}
              isDarkMode={isDarkMode}
            />
            <div className="mt-6 space-y-4">
              <Text style={{ color: subText }}>Model Type</Text>
              <Select
                placeholder="Select model type"
                style={{ width: "100%", marginTop: 4 }}
                value={modelType}
                onChange={setModelType}
              >
                <Option value="top">Top Half</Option>
                <Option value="bottom">Bottom Half</Option>
                <Option value="full">Full Body</Option>
              </Select>

              <Text style={{ color: subText }}>Gender</Text>
              <Select
                placeholder="Select gender"
                style={{ width: "100%", marginTop: 4 }}
                value={gender}
                onChange={setGender}
              >
                <Option value="male">Male</Option>
                <Option value="female">Female</Option>
                <Option value="unisex">Unisex</Option>
              </Select>
            </div>
          </div>
        </Col>

        {/* Garment Section */}
        <Col xs={24} md={12}>
          <div style={{ background: cardColor, padding: 24, borderRadius: 12 }}>
            <Title level={4} style={{ color: textColor, marginBottom: 16 }}>
              Garment Image
            </Title>
            <ImageUpload
              label="Upload Cloth Image"
              onImageChange={setClothImage}
              isDarkMode={isDarkMode}
            />
            <div className="mt-6 space-y-4">
              <Text style={{ color: subText }}>Garment Type</Text>
              <Select
                placeholder="Select garment type"
                style={{ width: "100%", marginTop: 4 }}
                value={garmentType}
                onChange={setGarmentType}
              >
                <Option value="shirt">Shirt</Option>
                <Option value="lehenga">Lehenga</Option>
                <Option value="saree">Saree</Option>
                <Option value="kurta">Kurta</Option>
              </Select>

              <Text style={{ color: subText }}>Style</Text>
              <Select
                placeholder="Select style"
                style={{ width: "100%", marginTop: 4 }}
                value={style}
                onChange={setStyle}
              >
                <Option value="casual">Casual</Option>
                <Option value="formal">Formal</Option>
                <Option value="festive">Festive</Option>
                <Option value="traditional">Traditional</Option>
              </Select>
            </div>
          </div>
        </Col>
      </Row>

      {/* Instructions */}
      <div style={{ marginTop: "2.5rem" }}>
        <Title level={5} style={{ color: textColor, marginBottom: "0.5rem" }}>
          Special Instructions
        </Title>
        <Input.TextArea
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          rows={4}
          placeholder="e.g. Fit for walking pose, crop top, side view preferred..."
          style={{
            borderRadius: 10,
            padding: "1rem",
            fontSize: "1rem",
            backgroundColor: isDarkMode ? "#1f1f1f" : "#ffffff",
            color: textColor,
            borderColor: isDarkMode ? "#333" : "#d1d5db",
          }}
        />
      </div>

      {/* Submit Button */}
      <div style={{ display: "flex", justifyContent: "center", marginTop: "3rem" }}>
        <Button
          type="primary"
          size="large"
          onClick={handleTryOn}
          loading={loading}
          style={{ height: 48, width: 200, fontSize: 16, borderRadius: 8 }}
        >
          {loading ? "Processing..." : "Try On"}
        </Button>
      </div>

     {result?.image && (
  <div ref={resultRef} style={{ marginTop: "5rem" }}>
    <Divider />
    <Title
      level={3}
      style={{
        color: textColor,
        textAlign: "center",
        marginBottom: 32,
      }}
    >
      Your Try-On Result
    </Title>
    <Card
      hoverable
      style={{
        maxWidth: 480,
        margin: "0 auto",
        background: cardColor,
        borderRadius: 16,
        boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
      }}
      cover={
        <img
          src={result.image}
          alt="Try-On Result"
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/300?text=Image+Not+Found";
          }}
          style={{
            width: "100%",
            height: 300,
            objectFit: "contain",
            borderRadius: "16px 16px 0 0",
            backgroundColor: "#f0f0f0",
          }}
        />
      }
    >
      <Text
        style={{
          display: "block",
          textAlign: "center",
          marginTop: 16,
          color: isDarkMode ? "#ffffff" : "#000000",
          fontSize: "1.25rem",
          fontWeight: "600",
        }}
      >
        {result.text}
      </Text>
      <Text
        type="secondary"
        style={{
          display: "block",
          textAlign: "center",
          marginTop: 4,
          fontSize: 12,
          color: isDarkMode ? "#999" : "#666",
        }}
      >
        {result.timestamp}
      </Text>
    </Card>
  </div>
)}


      {/* History */}
      {history.length > 0 && (
  <div style={{ marginTop: "4rem" }}>
    <Divider />
    <Title level={3} style={{ color: textColor, marginBottom: 32, textAlign: "center" }}>
      Previous Try-On Results
    </Title>
    <Row gutter={[24, 24]}>
      {history.map((item) => (
        <Col xs={24} sm={12} md={8} key={item.id}>
          <Card
            hoverable
            style={{
              background: cardColor,
              borderRadius: 12,
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
            cover={
              <img
                src={item.resultImage}
                alt="Previous Try-On"
                style={{
                  width: "100%",
                  height: 300,
                  objectFit: "contain",
                  borderRadius: "12px 12px 0 0",
                  backgroundColor: "#f0f0f0",
                }}
              />
            }
          >
            <Text
              style={{
                display: "block",
                color: isDarkMode ? "#ffffff" : "#000000",
                fontSize: "1rem",
                fontWeight: 600,
                marginBottom: 8,
              }}
            >
              {item.text}
            </Text>
            <Text
              type="secondary"
              style={{
                fontSize: 12,
                color: isDarkMode ? "#999" : "#666",
              }}
            >
              {item.timestamp}
            </Text>
          </Card>
        </Col>
      ))}
    </Row>
  </div>
)}

      
      {/* Loading Spinner */}
      {loading && (
        <div style={{ textAlign: "center", marginTop: "3rem" }}>
          <Spin size="large" />
        </div>
      )}
    </div>
  );
}

export default MainTryOnForm;
