import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { StoreProvider } from "@/contexts/StoreContext";
import ScrollToTop from "@/components/ScrollToTop";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import CategoryPage from "./pages/CategoryPage.tsx";
import ProductDetailPage from "./pages/ProductDetailPage.tsx";
import BookAppointmentPage from "./pages/BookAppointmentPage.tsx";
import AboutPage, { VisitStorePage, ContactPage } from "./pages/AboutPage.tsx";
import FAQPage from "./pages/FAQPage.tsx";
import { ShippingPolicyPage, ShippingDeliveryPage, ReturnsPolicyPage, PrivacyPolicyPage, TermsPage } from "./pages/PolicyPages.tsx";
import { WishlistPage, CartPage, SearchResultsPage, NewArrivalsPage, ReadyToShipPage, SalePage, SizeGuidePage, TrackOrderPage, WomenPage, MenPage } from "./pages/ShopPages.tsx";
import { CheckoutCancelPage, CheckoutSuccessPage } from "./pages/CheckoutPages.tsx";
import { localBusinessJsonLd } from "@/data/businessInfo";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <StoreProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
        />
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/new-arrivals" element={<NewArrivalsPage />} />
            <Route path="/ready-to-ship" element={<ReadyToShipPage />} />
            <Route path="/women" element={<WomenPage />} />
            <Route path="/men" element={<MenPage />} />
            <Route path="/category/:slug" element={<CategoryPage />} />
            <Route path="/product/:slug" element={<ProductDetailPage />} />
            <Route path="/book-appointment" element={<BookAppointmentPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/visit-store" element={<VisitStorePage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/shipping" element={<ShippingPolicyPage />} />
            <Route path="/shipping-policy" element={<ShippingDeliveryPage />} />
            <Route path="/shipping-delivery" element={<ShippingDeliveryPage />} />
            <Route path="/returns" element={<ReturnsPolicyPage />} />
            <Route path="/returns-policy" element={<ReturnsPolicyPage />} />
            <Route path="/returns-exchanges" element={<ReturnsPolicyPage />} />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout/success" element={<CheckoutSuccessPage />} />
            <Route path="/checkout/cancel" element={<CheckoutCancelPage />} />
            <Route path="/search" element={<SearchResultsPage />} />
            <Route path="/sale" element={<SalePage />} />
            <Route path="/size-guide" element={<SizeGuidePage />} />
            <Route path="/track-order" element={<TrackOrderPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </StoreProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
