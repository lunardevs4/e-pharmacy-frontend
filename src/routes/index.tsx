import React, { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import PublicRoute from './PublicRoute'
import SidebarLayout from '@/layouts/SidebarLayout'

const LandingPage = lazy(() => import('@/pages/public/Landing'))
const Login = lazy(() => import('@/pages/public/Login'))
const RegisterSelector = lazy(() => import('@/pages/public/RegisterSelector'))
const PatientRegister = lazy(() => import('@/pages/public/PatientRegister'))
const PharmacyRegister = lazy(() => import('@/pages/public/PharmacyRegister'))
const InsuranceRegister = lazy(() => import('@/pages/public/InsuranceRegister'))
const ForgotPassword = lazy(() => import('@/pages/public/ForgotPassword'))
const ChangePassword = lazy(() => import('@/pages/public/ChangePassword'))
const VerifyEmail = lazy(() => import('@/pages/public/VerifyEmail'))
const CheckEmail = lazy(() => import('@/pages/public/CheckEmail'))

const PatientDashboard = lazy(() => import('@/pages/patient/Dashboard'))
const MedicineSearch = lazy(() => import('@/pages/patient/MedicineSearch'))
const MedicineDetails = lazy(() => import('@/pages/patient/MedicineDetails'))
const Reservations = lazy(() => import('@/pages/patient/Reservations'))
const PatientHistory = lazy(() => import('@/pages/patient/History'))
const PatientReminders = lazy(() => import('@/pages/patient/Reminders'))
const SharedNotifications = lazy(() => import('@/pages/common/Notifications'))
const PatientProfile = lazy(() => import('@/pages/patient/Profile'))

const PharmacyDashboard = lazy(() => import('@/pages/pharmacy/Dashboard'))
const PharmacyInventory = lazy(() => import('@/pages/pharmacy/Inventory'))
const PharmacyReservations = lazy(() => import('@/pages/pharmacy/Reservations'))
const PharmacyInsuranceClaims = lazy(() => import('@/pages/pharmacy/InsuranceClaims'))
const PharmacyPatients = lazy(() => import('@/pages/pharmacy/Patients'))
const PharmacyStaff = lazy(() => import('@/pages/pharmacy/StaffManagement'))
const PharmacyAudit = lazy(() => import('@/pages/pharmacy/AuditTrail'))
const PharmacyReports = lazy(() => import('@/pages/pharmacy/Reports'))
const PharmacySettings = lazy(() => import('@/pages/pharmacy/Settings'))
const PharmacyProfile = lazy(() => import('@/pages/pharmacy/Profile'))
const PharmacyInsurance = lazy(() => import('@/pages/pharmacy/Insurance'))



const GovernmentDashboard = lazy(() => import('@/pages/government/Dashboard'))
const PharmacyRegistry = lazy(() => import('@/pages/government/PharmacyRegistry'))
const MedicineRegistry = lazy(() => import('@/pages/government/MedicineRegistry'))
const NationalAnalytics = lazy(() => import('@/pages/government/NationalAnalytics'))
const DistrictAnalytics = lazy(() => import('@/pages/government/DistrictAnalytics'))
const MedicineAnalytics = lazy(() => import('@/pages/government/MedicineAnalytics'))
const ProvinceAnalytics = lazy(() => import('@/pages/government/ProvinceAnalytics'))
const GovernmentCompliance = lazy(() => import('@/pages/government/Compliance'))
const GovernmentReports = lazy(() => import('@/pages/government/Reports'))

const InsuranceDashboard = lazy(() => import('@/pages/insurance/Dashboard'))
const InsuranceClaims = lazy(() => import('@/pages/insurance/Claims'))
const InsurancePatients = lazy(() => import('@/pages/insurance/Patients'))
const InsurancePayments = lazy(() => import('@/pages/insurance/Payments'))
const InsuranceReports = lazy(() => import('@/pages/insurance/Reports'))
const InsuranceTariffs = lazy(() => import('@/pages/insurance/Tariffs'))

const AdminDashboard = lazy(() => import('@/pages/admin/Dashboard'))
const AdminUsers = lazy(() => import('@/pages/admin/Users'))

const AdminRoles = lazy(() => import('@/pages/admin/Roles'))
const AdminSettings = lazy(() => import('@/pages/admin/Settings'))
const AdminAuditLogs = lazy(() => import('@/pages/admin/AuditLogs'))


export default function AppRoutes() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><span className="text-sm text-gray-500">Loading…</span></div>}>
      <Routes>
      <Route path="/" element={<LandingPage />} />

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

      <Route path="/change-password" element={<ChangePassword />} />

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
          
          <Route element={<ProtectedRoute allowedRoles={['PHARMACY', 'PHARMACY_OWNER']} />}>
            <Route path="staff" element={<PharmacyStaff />} />
            <Route path="audit" element={<PharmacyAudit />} />
          </Route>

          <Route path="reports" element={<PharmacyReports />} />
          <Route path="profile" element={<PharmacySettings />} />
          <Route path="notifications" element={<SharedNotifications />} />
        </Route>
      </Route>



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


      <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
