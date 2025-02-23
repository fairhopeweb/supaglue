import { deleteConnection, disableSyncForConnection, enableSyncForConnection } from '@/client';
import { DeleteConnection } from '@/components/connections/DeleteConnection';
import Spinner from '@/components/Spinner';
import { useNotification } from '@/context/notification';
import { useActiveApplicationId } from '@/hooks/useActiveApplicationId';
import { useActiveCustomerId } from '@/hooks/useActiveCustomerId';
import { useConnections } from '@/hooks/useConnections';
import Header from '@/layout/Header';
import { getServerSideProps } from '@/pages/applications/[applicationId]';
import providerToIcon from '@/utils/providerToIcon';
import { Box, Breadcrumbs, Stack, Switch, Typography } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';

export { getServerSideProps };

export default function Home() {
  const activeCustomerId = useActiveCustomerId();
  const { connections = [], isLoading, mutate } = useConnections(activeCustomerId);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { addNotification } = useNotification();

  const applicationId = useActiveApplicationId();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 300 },
    { field: 'category', headerName: 'Category', width: 100 },
    {
      field: 'providerName',
      headerName: 'Provider',
      width: 120,
      renderCell: (params) => providerToIcon(params.value.providerName),
    },
    { field: 'customerId', headerName: 'Customer ID', width: 180 },
    {
      field: 'sync_enabled',
      headerName: 'Sync Enabled?',
      width: 150,
      renderCell: (params) => {
        return (
          <Switch
            checked={params.row.isSyncEnabled}
            onChange={async (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
              if (checked) {
                const response = await enableSyncForConnection(applicationId, activeCustomerId, params.row.id);
                if (!response.ok) {
                  addNotification({ message: response.errorMessage, severity: 'error' });
                  return;
                }
                await mutate(
                  connections.map((c) => ({
                    ...c,
                    isSyncEnabled: c.id === params.row.id ? true : c.isSyncEnabled,
                  })),
                  false
                );
              } else {
                const response = await disableSyncForConnection(applicationId, activeCustomerId, params.row.id);
                if (!response.ok) {
                  addNotification({ message: response.errorMessage, severity: 'error' });
                  return;
                }
                await mutate(
                  connections.map((c) => ({
                    ...c,
                    isSyncEnabled: c.id === params.row.id ? false : c.isSyncEnabled,
                  })),
                  false
                );
              }
            }}
          />
        );
      },
    },
    {
      field: 'delete',
      headerName: 'Delete',
      width: 100,
      renderCell: (params) => {
        return (
          <DeleteConnection
            customerId={activeCustomerId}
            providerName={params.row.providerName}
            onDelete={async () => {
              const response = await deleteConnection(applicationId, activeCustomerId, params.row.id);
              if (!response.ok) {
                addNotification({ message: response.errorMessage, severity: 'error' });
                return;
              }
              await mutate(
                connections.filter((c) => c.id !== params.row.id),
                false
              );
            }}
          />
        );
      },
    },
  ];

  const rows = connections;

  return (
    <>
      <Head>
        <title>Supaglue Management Portal</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header title="Connections" onDrawerToggle={handleDrawerToggle} />
        <Box component="main" sx={{ flex: 1, py: 6, px: 4, bgcolor: '#eaeff1' }}>
          {isLoading ? (
            <Spinner />
          ) : (
            <Stack className="gap-2">
              <Breadcrumbs>
                <Link color="inherit" href={`/applications/${applicationId}`}>
                  Home
                </Link>
                <Link color="inherit" href={`/applications/${applicationId}/customers`}>
                  Customers
                </Link>
                <Typography color="text.primary">Connections</Typography>
              </Breadcrumbs>
              <div style={{ height: '100%', width: '100%' }}>
                <DataGrid
                  rows={rows}
                  columns={columns}
                  autoHeight
                  sx={{
                    boxShadow: 1,
                    backgroundColor: 'white',
                  }}
                  density="comfortable"
                  hideFooter
                  disableColumnMenu
                  rowSelection={false}
                />
              </div>
            </Stack>
          )}
        </Box>
      </Box>
    </>
  );
}
