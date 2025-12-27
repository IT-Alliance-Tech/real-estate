
import React, { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { AdminAuthProvider } from './context/AdminAuthContext'
import Layout from './components/common/Layout/Layout'
import ErrorBoundary from './components/common/ErrorBoundary'
// ✅ Newly added imports
import SuccessPage from './components/pages/subscription/SuccessPage'
import ErrorPage from './components/pages/subscription/ErrorPage'
import ProcessingPage from './components/pages/subscription/ProcessingPage' // <-- Added

const HomePage = lazy(() => import('./components/pages/Home/HomePage'))
// Removed NewHomePage import

import OwnerDashboard from './components/pages/Owner/OwnerDashboard'
import SecretAdminAccess from './components/pages/Admin/SecretAdminAccess'
import PropertyDetailsPage from './components/pages/Property/PropertyDetailsPage'
import WishlistPage from './components/pages/Wishlist/WishlistPage'
import MyBookings from './components/pages/bookings/MyBookings'
import PropertiesPage from './components/pages/Property/Properties'
import MySubscription from './components/pages/Profile/MySubscription'
import ScrollToTop from './components/common/ScrollToTop'

// Moved components imports
import ContactPage from './components/pages/General/ContactPage'
import AboutPage from './components/pages/General/AboutPage'
import FaqPage from './components/pages/General/FaqPage'
import SubscriptionPlans from './components/pages/General/SubscriptionPlans'
import TermsAndConditions from './components/pages/Legal/TermConditionPage' // Renamed from TermConditionPage
import PrivacyPolicy from './components/pages/Legal/PrivacyPolicyPage'
import PaymentCallback from './components/pages/Payment/PaymentCallback'
import DummyPayment from './components/pages/Payment/DummyPayment'

import './styles/globals.css'
import './styles/components.css'

import AdminDashboardRoute from './components/pages/Admin/AdminDashboardRoute'
import ProtectedRoute from './components/common/ProtectedRoute'

// comment added

// Helper component to wrap routes with Layout and ErrorBoundary
const LayoutWrapper = ({ children }) => (
  <Layout>
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  </Layout>
)

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AdminAuthProvider>
          <Router>
            <ScrollToTop />
            <Routes>
              {/* Main App Route */}
              <Route path="/" element={<LayoutWrapper><Suspense fallback={null}><HomePage /></Suspense></LayoutWrapper>} />

              {/* Owner Routes */}
              <Route 
                path="/owner-dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['owner']}>
                    <LayoutWrapper><OwnerDashboard /></LayoutWrapper>
                  </ProtectedRoute>
                } 
              />

              {/* Public Pages */}
              <Route path="/contact" element={<LayoutWrapper><ContactPage /></LayoutWrapper>} />
              <Route path="/about" element={<LayoutWrapper><AboutPage /></LayoutWrapper>} />
              <Route path="/privacy" element={<LayoutWrapper><PrivacyPolicy /></LayoutWrapper>} />
              <Route path="/termcondition" element={<LayoutWrapper><TermsAndConditions /></LayoutWrapper>} />
              <Route path="/faq" element={<LayoutWrapper><FaqPage /></LayoutWrapper>} />
              <Route path="/properties" element={<LayoutWrapper><PropertiesPage /></LayoutWrapper>} />

              {/* Subscription Plans Page */}
              <Route path="/subscription-plans" element={<LayoutWrapper><SubscriptionPlans /></LayoutWrapper>} />

              {/* Payment Callback Page */}
              <Route path="/payment/callback" element={<LayoutWrapper><PaymentCallback /></LayoutWrapper>} />
              <Route path="/payment/dummy" element={<DummyPayment />} />

              {/* Property & User Pages */}
              <Route path="/property/:id" element={<LayoutWrapper><PropertyDetailsPage /></LayoutWrapper>} />
              <Route 
                path="/wishlist" 
                element={
                  <ProtectedRoute allowedRoles={['user', 'owner']}>
                    <LayoutWrapper><WishlistPage /></LayoutWrapper>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/my-bookings" 
                element={
                  <ProtectedRoute allowedRoles={['user']}>
                    <LayoutWrapper><MyBookings /></LayoutWrapper>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/my-subscription" 
                element={
                    <ProtectedRoute allowedRoles={['user', 'owner']}>
                    <LayoutWrapper><MySubscription /></LayoutWrapper>
                  </ProtectedRoute>
                } 
              />

              {/* ✅ FontPage / PhonePe Integration Result Pages */}
              <Route path="/processing" element={<LayoutWrapper><ProcessingPage /></LayoutWrapper>} />
              <Route path="/success" element={<LayoutWrapper><SuccessPage /></LayoutWrapper>} />
              <Route path="/error" element={<LayoutWrapper><ErrorPage /></LayoutWrapper>} />

              {/* Admin Routes */}
              <Route path="/admin" element={<Navigate to="/system/admin/secure-access-portal-2025" replace />} />
              <Route
                path="/system/admin/secure-access-portal-2025"
                element={<ErrorBoundary><SecretAdminAccess /></ErrorBoundary>}
              />
              <Route
                path="/admin/dashboard"
                element={<ErrorBoundary><AdminDashboardRoute /></ErrorBoundary>}
              />

              {/* Fallback Route */}
              <Route path="*" element={<LayoutWrapper><Suspense fallback={null}><HomePage /></Suspense></LayoutWrapper>} />
            </Routes>
          </Router>
        </AdminAuthProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
