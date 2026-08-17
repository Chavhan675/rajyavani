import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./lib/AuthContext";
import HomePage from "./pages/HomePage";
import LegalPage from "./pages/LegalPage";
import AdminPage from "./pages/AdminPage";
import ArticlePage from "./pages/ArticlePage";
import ArchivePage from "./pages/ArchivePage";
import DistrictPage from "./pages/DistrictPage";

// Sample content for legal pages
const privacyContent = `
आमचे गोपनीयता धोरण (Privacy Policy) स्पष्ट करते की आम्ही तुमची माहिती कशी गोळा करतो, वापरतो आणि संरक्षित करतो. 

आम्ही तुमच्या गोपनीयतेचा आदर करतो आणि तुमची वैयक्तिक माहिती सुरक्षित ठेवण्यासाठी वचनबद्ध आहोत. वेबसाइट वापरताना आम्ही तुमच्याकडून जी माहिती मिळवतो, ती फक्त तुम्हाला चांगला अनुभव देण्यासाठी वापरली जाते. 

कुकीज (Cookies) चा वापर जाहिराती (Google AdSense) आणि विश्लेषण (Analytics) साठी केला जातो.
`;

const aboutContent = `
राज्यवाणी हे महाराष्ट्राचे क्रमांक १ चे AI-सक्षम डिजिटल न्यूज प्लॅटफॉर्म आहे. 

गाव, तालुका, जिल्हा ते राज्यभरातील प्रत्येक महत्त्वाची बातमी सर्वात आधी तुमच्यापर्यंत पोहोचवणे हे आमचे ध्येय आहे. आमच्या प्लॅटफॉर्मवर कृत्रिम बुद्धिमत्तेचा (AI) वापर करून बातम्यांचे संकलन आणि वर्गीकरण वेगाने केले जाते.

आमचा विश्वास सत्य, वेगवान आणि विश्वासार्ह पत्रकारितेवर आहे.
`;

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/article/:id" element={<ArticlePage />} />
          <Route path="/category/:category" element={<ArchivePage />} />
          <Route path="/district/:slug" element={<DistrictPage />} />
          <Route path="/location/district/:name" element={<DistrictPage />} />
          <Route path="/location/:type/:name" element={<ArchivePage />} />
          <Route path="/tag/:tag" element={<ArchivePage />} />
          <Route path="/author/:authorId" element={<ArchivePage />} />
          <Route path="/search" element={<ArchivePage />} />
          
          <Route path="/about" element={<LegalPage title="आमच्याबद्दल (About Us)" content={aboutContent} />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/privacy-policy" element={<LegalPage title="गोपनीयता धोरण (Privacy Policy)" content={privacyContent} />} />
          <Route path="/terms" element={<LegalPage title="अटी आणि शर्ती (Terms)" content="वेबसाइट वापरण्यासाठी लागू असणाऱ्या अटी आणि शर्ती." />} />
          <Route path="/editorial-policy" element={<LegalPage title="संपादकीय धोरण (Editorial Policy)" content="आमचे संपादकीय धोरण बातम्यांची सत्यता आणि गुणवत्ता सुनिश्चित करते." />} />
          <Route path="/fact-checking" element={<LegalPage title="फॅक्ट-चेकिंग धोरण" content="राज्यावाणीवरील प्रत्येक बातमी तथ्य-तपासणी प्रक्रियेतून जाते." />} />
          <Route path="/disclaimer" element={<LegalPage title="अस्वीकरण (Disclaimer)" content="या वेबसाइटवरील माहिती केवळ सामान्य माहितीसाठी आहे." />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

