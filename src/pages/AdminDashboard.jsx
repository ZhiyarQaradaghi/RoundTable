import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  CircularProgress,
  Button,
  Stack,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";
import UserNameWithRole from "../components/UserNameWithRole";
import { getApiUrl } from "../config/api";

export default function AdminDashboard() {
  const { user } = useAuth();
  if (!user || user.role !== "admin") {
    return null;
  }
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetch(getApiUrl("/api/reports"), { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        setReports(data.reports || []);
        setLoading(false);
      });
  }, []);

  const handleUpdateStatus = async (id, status) => {
    setUpdatingId(id);
    await fetch(getApiUrl(`/api/reports/${id}/status`), {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });
    setReports((prev) =>
      prev.map((r) => (r._id === id ? { ...r, status } : r))
    );
    setUpdatingId(null);
  };

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
        Reports
      </Typography>
      <Paper sx={{ p: 2 }}>
        {loading ? (
          <CircularProgress />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Reporter</TableCell>
                <TableCell>Reported User</TableCell>
                <TableCell>Discussion</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report._id}>
                  <TableCell>
                    <UserNameWithRole user={report.reporter} />
                  </TableCell>
                  <TableCell>
                    <UserNameWithRole user={report.reportedUser} />
                  </TableCell>
                  <TableCell>{report.discussion?.title || "-"}</TableCell>
                  <TableCell>
                    <Chip label={report.category} />
                  </TableCell>
                  <TableCell>{report.description}</TableCell>
                  <TableCell>
                    <Chip
                      label={report.status}
                      color={
                        report.status === "resolved"
                          ? "success"
                          : report.status === "rejected"
                          ? "error"
                          : "warning"
                      }
                    />
                  </TableCell>
                  <TableCell>
                    {report.status === "pending" && (
                      <Stack direction="row" spacing={1}>
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          disabled={updatingId === report._id}
                          onClick={() =>
                            handleUpdateStatus(report._id, "resolved")
                          }
                        >
                          Accept
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          color="error"
                          disabled={updatingId === report._id}
                          onClick={() =>
                            handleUpdateStatus(report._id, "rejected")
                          }
                        >
                          Reject
                        </Button>
                      </Stack>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>
    </Container>
  );
}
