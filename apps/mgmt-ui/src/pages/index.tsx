import MetricCard from '@/components/customers/MetricCard';
import DashboardCard from '@/components/dashboard/DashboardCard';
import { useCustomers } from '@/hooks/useCustomers';
import { useSyncHistory } from '@/hooks/useSyncHistory';
import Header from '@/layout/Header';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { CloudUploadOutlined, Link, PeopleAltOutlined } from '@mui/icons-material';
import { Box, Grid } from '@mui/material';
import { type GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth/next';
import Head from 'next/head';
import { useState } from 'react';

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return {
      redirect: {
        destination: '/api/auth/signin',
        permanent: false,
      },
    };
  }

  return {
    props: { session },
  };
};

export default function Home() {
  const { customers = [] } = useCustomers();
  const { syncHistory = [] } = useSyncHistory();
  const [mobileOpen, setMobileOpen] = useState(false);

  const totalConnections = customers
    ?.map((customer: any /* TODO: @supaglue/core/types */) => customer.connections.length)
    .reduce((a: number, b: number) => a + b, 0);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <>
      <Head>
        <title>Supaglue Management UI</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header title="Dashboard" onDrawerToggle={handleDrawerToggle} />
        <Box className="space-y-4" component="main" sx={{ flex: 1, py: 6, px: 4, bgcolor: '#eaeff1' }}>
          <DashboardCard>Welcome to your Supaglue dashboard!</DashboardCard>

          <Grid container spacing={2}>
            <Grid item xs={4}>
              <MetricCard
                icon={<PeopleAltOutlined />}
                title="Total customers"
                value={`${customers.length} customers`}
              />
            </Grid>
            <Grid item xs={4}>
              <MetricCard icon={<CloudUploadOutlined />} title="Total syncs" value={`${syncHistory.length} syncs`} />
            </Grid>
            <Grid item xs={4}>
              <MetricCard icon={<Link />} title="Total connections" value={`${totalConnections} connections`} />
            </Grid>
          </Grid>
          {/*
          <Card>
            <CardHeader title={<Typography variant="h6">Client SDKs</Typography>} />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Card>
                        <CardContent>Typescript</CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={6}>
                      <Card>
                        <CardContent>Python</CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={6}>
                      <Card>
                        <CardContent>PHP</CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={6}>
                      <Card>
                        <CardContent>.NET</CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={6}>
                      <Card>
                        <CardContent>Ruby</CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={6}>
                      <Card>
                        <CardContent>Go</CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Grid>

                <Grid item xs={6}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Card>
                        <CardContent>Code block 1</CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12}>
                      <Card>
                        <CardContent>Code block 2</CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        */}
        </Box>
      </Box>
    </>
  );
}
