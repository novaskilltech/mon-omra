import { redirect } from 'next/navigation';
import { isAdminAuthenticated } from '@/lib/actions/auth';
import ShopClient from './ShopClient';

export const dynamic = 'force-dynamic';

export default async function ShopPage() {
    const isAdmin = await isAdminAuthenticated();
    
    // Security restriction: redirect normal pilgrims to dashboard
    if (!isAdmin) {
        redirect('/dashboard');
    }

    return <ShopClient />;
}
