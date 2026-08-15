import React, { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { PharmacyApi } from '@/services/pharmacy-api'
export default function PharmacyProfile() {
    const { user } = useAuthStore();
    const [pharmacy, setPharmacy] = useState<any>(user?.pharmacy || null);
    const [error, setError] = useState<string | null>(null);
    useEffect(() => {
        const id = user?.pharmacy?.id || user?.pharmacyId;
        if (id)
            PharmacyApi.getDetails(id)
                .then(setPharmacy)
                .catch((err) => setError(err.message))
    },
        [user?.pharmacy?.id, user?.pharmacyId]
    );
    return(
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">Pharmacy Profile</h1>
        {
            error && <p className="text-red-600">{error}</p>
        }
        <dl className="grid gap-3 text-sm md:grid-cols-2">
            {
                [
                    ['Name', pharmacy?.name],
                    ['Phone', pharmacy?.phone],
                    ['Address', pharmacy?.address],
                    ['Province', pharmacy?.province],
                    ['District', pharmacy?.district],
                    ['Status', pharmacy?.status]
                ].map(
                    ([label, value]) =>
                        <div key={label as string}>
                            <dt className="font-bold text-gray-500">{label}</dt>
                            <dd>{value || '—'}</dd>
                        </div>
                )
            }
        </dl>
    </div>
    )
}
