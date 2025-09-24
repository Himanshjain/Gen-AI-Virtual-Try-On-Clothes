import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import {
  Layout,
  ConfigProvider,
  theme,
  Switch,
  Typography,
  Button,
} from "antd";
import { BulbOutlined, BulbFilled } from "@ant-design/icons";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import MainTryOnForm from "./components/MainTryOnForm";
import Catalogue from "./pages/Catalogue";
import Footer from "./components/Footer";

const { Header, Content } = Layout;
const { Title } = Typography;

function App() {
  const [personImage, setPersonImage] = useState(null);
  const [clothImage, setClothImage] = useState(null);
  const [instructions, setInstructions] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [modelType, setModelType] = useState("");
  const [gender, setGender] = useState("");
  const [garmentType, setGarmentType] = useState("");
  const [style, setStyle] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    return saved ? JSON.parse(saved) : false;
  });

  const { defaultAlgorithm, darkAlgorithm } = theme;
  const bgColor = isDarkMode ? "#0f0f0f" : "#f9fafb";
  const textColor = isDarkMode ? "#e4e4e4" : "#111827";

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!personImage || !clothImage) {
      toast.error("Please upload both model and garment images.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("person_image", personImage);
    formData.append("cloth_image", clothImage);
    formData.append("instructions", instructions);
    formData.append("model_type", modelType);
    formData.append("gender", gender);
    formData.append("garment_type", garmentType);
    formData.append("style", style);

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
    <Router>
      <ConfigProvider
        theme={{
          algorithm: isDarkMode ? darkAlgorithm : defaultAlgorithm,
          token: {
            colorPrimary: "#0ea5e9",
            borderRadius: 10,
          },
        }}
      >
        <Layout style={{ minHeight: "100vh", background: bgColor }}>
          <Header
            style={{
              background: "transparent",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "1.5rem 2rem",
            }}
          >
            <Title level={3} style={{ margin: 0, color: textColor }}>
              👗 Virtual Try-On
            </Title>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <Button
                type="default"
                onClick={() => window.location.href = "/catalogue"}
                style={{
                  borderRadius: 8,
                  fontWeight: 500,
                  backgroundColor: isDarkMode ? "#1c1c1c" : "#ffffff",
                  color: isDarkMode ? "#e4e4e4" : "#111827",
                  border: `1px solid ${isDarkMode ? "#333" : "#d1d5db"}`,
                }}
              >
                Browse Catalogue
              </Button>
              <Switch
                checked={isDarkMode}
                onChange={setIsDarkMode}
                checkedChildren={<BulbFilled />}
                unCheckedChildren={<BulbOutlined />}
              />
            </div>
          </Header>

          <Content style={{ padding: "2rem 1rem" }}>
            <Routes>
              <Route
                path="/"
                element={
                  <MainTryOnForm
                    personImage={personImage}
                    setPersonImage={setPersonImage}
                    clothImage={clothImage}
                    setClothImage={setClothImage}
                    instructions={instructions}
                    setInstructions={setInstructions}
                    modelType={modelType}
                    setModelType={setModelType}
                    gender={gender}
                    setGender={setGender}
                    garmentType={garmentType}
                    setGarmentType={setGarmentType}
                    style={style}
                    setStyle={setStyle}
                    result={result}
                    setResult={setResult}
                    history={history}
                    setHistory={setHistory}
                    loading={loading}
                    setLoading={setLoading}
                    isDarkMode={isDarkMode}
                    handleSubmit={handleSubmit}
                  />
                }
              />
              <Route
                path="/catalogue"
                element={<Catalogue personImage={personImage} />}
              />
            </Routes>
          </Content>

          <Footer isDarkMode={isDarkMode} />
          <ToastContainer theme={isDarkMode ? "dark" : "light"} />
        </Layout>
      </ConfigProvider>
    </Router>
  );
}

export default App;
