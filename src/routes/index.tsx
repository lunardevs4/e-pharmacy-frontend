import React, { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import PublicRoute from './PublicRoute'
import SidebarLayout from '@/layouts/SidebarLayout'

function lazyRetry<T extends React.ComponentType<any>>(
  componentImport: () => Promise<{ default: T }>
) {
  return lazy(async () => {
    const storageKey = 'epharmacy_lazy_retry'
    try {
      const component = await componentImport()
      if (typeof window !== 'undefined') {
        window.sessionStorage.removeItem(storageKey)
      }
      return component
    } catch (error: any) {
      const isChunkError =
        error?.message?.includes('dynamically imported module') ||
        error?.message?.includes('Failed to fetch') ||
        error?.name === 'ChunkLoadError'

      if (isChunkError && typeof window !== 'undefined') {
        const hasReloaded = window.sessionStorage.getItem(storageKey)
        if (!hasReloaded) {
          window.sessionStorage.setItem(storageKey, 'true')
          window.location.reload()
          return new Promise<{ default: T }>(() => {})
        }
      }
      throw error
    }
  })
}

const LandingPage = lazyRetry(() => import('@/pages/public/Landing'))
const Login = lazyRetry(() => import('@/pages/public/Login'))
const RegisterSelector = lazyRetry(() => import('@/pages/public/RegisterSelector'))
const PatientRegister = lazyRetry(() => import('@/pages/public/PatientRegister'))
const PharmacyRegister = lazyRetry(() => import('@/pages/public/PharmacyRegister'))
const InsuranceRegister = lazyRetry(() => import('@/pages/public/InsuranceRegister'))
const ForgotPassword = lazyRetry(() => import('@/pages/public/ForgotPassword'))
const ChangePassword = lazyRetry(() => import('@/pages/public/ChangePassword'))
const VerifyEmail = lazyRetry(() => import('@/pages/public/VerifyEmail'))
const CheckEmail = lazyRetry(() => import('@/pages/public/CheckEmail'))
const NotFound = lazyRetry(() => import('@/pages/public/NotFound'))

const PatientDashboard = lazyRetry(() => import('@/pages/patient/Dashboard'))
const MedicineSearch = lazyRetry(() => import('@/pages/patient/MedicineSearch'))
const MedicineDetails = lazyRetry(() => import('@/pages/patient/MedicineDetails'))
const Reservations = lazyRetry(() => import('@/pages/patient/Reservations'))
const PatientHistory = lazyRetry(() => import('@/pages/patient/History'))
const PatientReminders = lazyRetry(() => import('@/pages/patient/Reminders'))
const SharedNotifications = lazyRetry(() => import('@/pages/common/Notifications'))
const PatientProfile = lazyRetry(() => import('@/pages/patient/Profile'))

const PharmacyDashboard = lazyRetry(() => import('@/pages/pharmacy/Dashboard'))
const PharmacyInventory = lazyRetry(() => import('@/pages/pharmacy/Inventory'))
const PharmacyReservations = lazyRetry(() => import('@/pages/pharmacy/Reservations'))
const PharmacyInsuranceClaims = lazyRetry(() => import('@/pages/pharmacy/InsuranceClaims'))
const PharmacyPatients = lazyRetry(() => import('@/pages/pharmacy/Patients'))
const PharmacyStaff = lazyRetry(() => import('@/pages/pharmacy/StaffManagement'))
const PharmacyAudit = lazyRetry(() => import('@/pages/pharmacy/AuditTrail'))
const PharmacyReports = lazyRetry(() => import('@/pages/pharmacy/Reports'))
const PharmacySettings = lazyRetry(() => import('@/pages/pharmacy/Settings'))
const PharmacyProfile = lazyRetry(() => import('@/pages/pharmacy/Profile'))
const PharmacyInsurance = lazyRetry(() => import('@/pages/pharmacy/Insurance'))

const GovernmentDashboard = lazyRetry(() => import('@/pages/government/Dashboard'))
const PharmacyRegistry = lazyRetry(() => import('@/pages/government/PharmacyRegistry'))
const MedicineRegistry = lazyRetry(() => import('@/pages/government/MedicineRegistry'))
const NationalAnalytics = lazyRetry(() => import('@/pages/government/NationalAnalytics'))
const DistrictAnalytics = lazyRetry(() => import('@/pages/government/DistrictAnalytics'))
const MedicineAnalytics = lazyRetry(() => import('@/pages/government/MedicineAnalytics'))
const ProvinceAnalytics = lazyRetry(() => import('@/pages/government/ProvinceAnalytics'))
const GovernmentCompliance = lazyRetry(() => import('@/pages/government/Compliance'))
const GovernmentReports = lazyRetry(() => import('@/pages/government/Reports'))

const InsuranceDashboard = lazyRetry(() => import('@/pages/insurance/Dashboard'))
const InsuranceClaims = lazyRetry(() => import('@/pages/insurance/Claims'))
const InsurancePatients = lazyRetry(() => import('@/pages/insurance/Patients'))
const InsurancePayments = lazyRetry(() => import('@/pages/insurance/Payments'))
const InsuranceReports = lazyRetry(() => import('@/pages/insurance/Reports'))
const InsuranceTariffs = lazyRetry(() => import('@/pages/insurance/Tariffs'))

const AdminDashboard = lazyRetry(() => import('@/pages/admin/Dashboard'))
const AdminUsers = lazyRetry(() => import('@/pages/admin/Users'))
const AdminRoles = lazyRetry(() => import('@/pages/admin/Roles'))
const AdminSettings = lazyRetry(() => import('@/pages/admin/Settings'))
const AdminAuditLogs = lazyRetry(() => import('@/pages/admin/AuditLogs'))


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


      <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}
