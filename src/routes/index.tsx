import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import PublicRoute from './PublicRoute'
import SidebarLayout from '@/layouts/SidebarLayout'

// Public Pages
import LandingPage from '@/pages/public/Landing'
import Login from '@/pages/public/Login'
import RegisterSelector from '@/pages/public/RegisterSelector'
import PatientRegister from '@/pages/public/PatientRegister'
import PharmacyRegister from '@/pages/public/PharmacyRegister'
import InsuranceRegister from '@/pages/public/InsuranceRegister'
import ForgotPassword from '@/pages/public/ForgotPassword'
import ChangePassword from '@/pages/public/ChangePassword'
import VerifyEmail from '@/pages/public/VerifyEmail'
import CheckEmail from '@/pages/public/CheckEmail'

// Patient Pages
import PatientDashboard from '@/pages/patient/Dashboard'
import MedicineSearch from '@/pages/patient/MedicineSearch'
import MedicineDetails from '@/pages/patient/MedicineDetails'
import Reservations from '@/pages/patient/Reservations'
import PatientHistory from '@/pages/patient/History'
import PatientReminders from '@/pages/patient/Reminders'
import SharedNotifications from '@/pages/common/Notifications'
import PatientProfile from '@/pages/patient/Profile'

// Pharmacy Pages
import PharmacyDashboard from '@/pages/pharmacy/Dashboard'
import PharmacyInventory from '@/pages/pharmacy/Inventory'
import PharmacyReservations from '@/pages/pharmacy/Reservations'
import PharmacyInsuranceClaims from '@/pages/pharmacy/InsuranceClaims'
import PharmacyPatients from '@/pages/pharmacy/Patients'
import PharmacyStaff from '@/pages/pharmacy/StaffManagement'
import PharmacyAudit from '@/pages/pharmacy/AuditTrail'
import PharmacyReports from '@/pages/pharmacy/Reports'
import PharmacySettings from '@/pages/pharmacy/Settings'
import PharmacyProfile from '@/pages/pharmacy/Profile'
import PharmacyInsurance from '@/pages/pharmacy/Insurance'



// Government Pages
import GovernmentDashboard from '@/pages/government/Dashboard'
import PharmacyRegistry from '@/pages/government/PharmacyRegistry'
import MedicineRegistry from '@/pages/government/MedicineRegistry'
import NationalAnalytics from '@/pages/government/NationalAnalytics'
import DistrictAnalytics from '@/pages/government/DistrictAnalytics'
import MedicineAnalytics from '@/pages/government/MedicineAnalytics'
import ProvinceAnalytics from '@/pages/government/ProvinceAnalytics'
import GovernmentCompliance from '@/pages/government/Compliance'
import GovernmentReports from '@/pages/government/Reports'

// Insurance Pages
import InsuranceDashboard from '@/pages/insurance/Dashboard'
import InsuranceClaims from '@/pages/insurance/Claims'
import InsurancePatients from '@/pages/insurance/Patients'
import InsurancePayments from '@/pages/insurance/Payments'
import InsuranceReports from '@/pages/insurance/Reports'
import InsuranceTariffs from '@/pages/insurance/Tariffs'

// Admin Pages
import AdminDashboard from '@/pages/admin/Dashboard'
import AdminUsers from '@/pages/admin/Users'

import AdminRoles from '@/pages/admin/Roles'
import AdminSettings from '@/pages/admin/Settings'
import AdminAuditLogs from '@/pages/admin/AuditLogs'


export default function AppRoutes() {
  return (
    <Routes>
      {/* Unrestricted Landing Page */}
      <Route path="/" element={<LandingPage />} />

      {/* Public Routes (Guests only, redirects if authenticated) */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<RegisterSelector />} />
        <Route path="/register/patient" element={<PatientRegister />} />
        <Route path="/register/pharmacy" element={<PharmacyRegister />} />
        <Route path="/register/insurance" element={<InsuranceRegister />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/check-email" element={<CheckEmail />} />
        <Route path="/reset-password" element={<ForgotPassword />} />
        <Route path="/success" element={<ForgotPassword />} />
      </Route>

      {/* Auth State Pending Password Enforce Route */}
      <Route path="/change-password" element={<ChangePassword />} />

      {/* Patient Portal */}
      <Route element={<ProtectedRoute allowedRoles={['PATIENT']} />}>
        <Route path="/patient" element={<SidebarLayout />}>
          <Route index element={<PatientDashboard />} />
          <Route path="search" element={<MedicineSearch />} />
          <Route path="details" element={<MedicineDetails />} />
          <Route path="reservations" element={<Reservations />} />
          <Route path="history" element={<PatientHistory />} />
          <Route path="reminders" element={<PatientReminders />} />
          <Route path="notifications" element={<SharedNotifications />} />
          <Route path="profile" element={<PatientProfile />} />
        </Route>
      </Route>

      {/* Pharmacy Portal */}
      <Route element={<ProtectedRoute allowedRoles={['PHARMACY', 'PHARMACY_OWNER', 'PHARMACIST']} />}>
        <Route path="/pharmacy" element={<SidebarLayout />}>
          <Route index element={<PharmacyDashboard />} />
          <Route path="inventory" element={<PharmacyInventory />} />
          <Route path="reservations" element={<PharmacyReservations />} />
          <Route path="patients" element={<PharmacyPatients />} />
          <Route path="claims" element={<PharmacyInsuranceClaims />} />
          <Route element={<ProtectedRoute allowedRoles={['PHARMACY', 'PHARMACY_OWNER', 'PHARMACIST']} />}>
            <Route path="insurance" element={<PharmacyInsurance />} />
          </Route>
          
          {/* Owner Only Routes */}
          <Route element={<ProtectedRoute allowedRoles={['PHARMACY', 'PHARMACY_OWNER']} />}>
            <Route path="staff" element={<PharmacyStaff />} />
            <Route path="audit" element={<PharmacyAudit />} />
          </Route>

          <Route path="reports" element={<PharmacyReports />} />
          <Route path="profile" element={<PharmacySettings />} />
          <Route path="notifications" element={<SharedNotifications />} />
        </Route>
      </Route>



      {/* Government Portal */}
      <Route element={<ProtectedRoute allowedRoles={['GOVERNMENT']} />}>
        <Route path="/government" element={<SidebarLayout />}>
          <Route index element={<GovernmentDashboard />} />
          <Route path="pharmacies" element={<PharmacyRegistry />} />
          <Route path="medicines" element={<MedicineRegistry />} />
          <Route path="analytics" element={<NationalAnalytics />} />
          <Route path="districts" element={<DistrictAnalytics />} />
          <Route path="medicine-analytics" element={<MedicineAnalytics />} />
          <Route path="province-analytics" element={<ProvinceAnalytics />} />
          <Route path="compliance" element={<GovernmentCompliance />} />
          <Route path="reports" element={<GovernmentReports />} />
          <Route path="notifications" element={<SharedNotifications />} />
        </Route>
      </Route>

      {/* Insurance Portal */}
      <Route element={<ProtectedRoute allowedRoles={['INSURANCE']} />}>
        <Route path="/insurance" element={<SidebarLayout />}>
          <Route index element={<InsuranceDashboard />} />
          <Route path="claims" element={<InsuranceClaims />} />
          <Route path="patients" element={<InsurancePatients />} />
          <Route path="payments" element={<InsurancePayments />} />
          <Route path="reports" element={<InsuranceReports />} />
          <Route path="tariffs" element={<InsuranceTariffs />} />
          <Route path="notifications" element={<SharedNotifications />} />
        </Route>
      </Route>

      {/* Admin Portal */}
      <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
        <Route path="/admin" element={<SidebarLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="roles" element={<AdminRoles />} />
          <Route path="profile" element={<AdminSettings />} />
          <Route path="audit" element={<AdminAuditLogs />} />
          <Route path="notifications" element={<SharedNotifications />} />
        </Route>
      </Route>


      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
