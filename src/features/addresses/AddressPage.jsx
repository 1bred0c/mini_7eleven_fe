import React, { useState, useEffect } from "react";
import {
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Alert,
  Box,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { addressApi } from "../../api/addressApi";
import LoadingState from "../../components/LoadingState";
import ErrorState from "../../components/ErrorState";
import EmptyState from "../../components/EmptyState";
import ConfirmDialog from "../../components/ConfirmDialog";
import PageHeader from "../../components/PageHeader";

const AddressPage = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Dialog management
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentAddress, setCurrentAddress] = useState(null); // null means "Create"
  const [receiverName, setReceiverName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [ward, setWard] = useState("");
  const [district, setDistrict] = useState("");
  const [city, setCity] = useState("");
  const [isDefault, setIsDefault] = useState(false);

  const [submitError, setSubmitError] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Delete confirmation
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await addressApi.getAddresses();
      // Handle both array and paginated formats
      const data = Array.isArray(res) ? res : res.content || [];
      setAddresses(data);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load addresses.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setCurrentAddress(null);
    setReceiverName("");
    setPhoneNumber("");
    setAddressLine("");
    setWard("");
    setDistrict("");
    setCity("");
    setIsDefault(false);
    setSubmitError("");
    setErrors({});
    setDialogOpen(true);
  };

  const handleOpenEdit = (addr) => {
    setCurrentAddress(addr);
    setReceiverName(addr.receiverName);
    setPhoneNumber(addr.phoneNumber);
    setAddressLine(addr.addressLine);
    setWard(addr.ward || "");
    setDistrict(addr.district || "");
    setCity(addr.city || "");
    setIsDefault(addr.isDefault || false);
    setSubmitError("");
    setErrors({});
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    
    // Client-side validation
    const newErrors = {};
    if (!receiverName.trim()) {
      newErrors.receiverName = "Receiver name is required.";
    }
    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required.";
    } else if (!/^[0-9+()#.\s-]{8,20}$/.test(phoneNumber)) {
      newErrors.phoneNumber = "Invalid phone number format.";
    }
    if (!addressLine.trim()) {
      newErrors.addressLine = "Address line is required.";
    }
    if (!ward.trim()) {
      newErrors.ward = "Ward is required.";
    }
    if (!district.trim()) {
      newErrors.district = "District is required.";
    }
    if (!city.trim()) {
      newErrors.city = "City is required.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setSubmitError("Please fix the validation errors below.");
      return;
    }

    setErrors({});
    setSubmitLoading(true);
    try {
      const payload = {
        receiverName,
        phoneNumber,
        addressLine,
        ward,
        district,
        city,
        isDefault,
      };

      if (currentAddress) {
        await addressApi.updateAddress(currentAddress.id, payload);
      } else {
        await addressApi.createAddress(payload);
      }
      setDialogOpen(false);
      fetchAddresses();
    } catch (err) {
      console.error(err);
      setSubmitError(err.message || "Failed to save address details.");
      if (err.errors) {
        setErrors(err.errors);
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await addressApi.setDefaultAddress(id);
      fetchAddresses();
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to set default address.");
    }
  };

  const handleOpenDelete = (id) => {
    setDeleteId(id);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      await addressApi.deleteAddress(deleteId);
      setDeleteOpen(false);
      fetchAddresses();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to delete address.");
      setDeleteOpen(false);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Delivery Addresses"
        subtitle="Manage your physical delivery addresses for ordering convenience store items."
        action={
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenCreate}
          >
            Add Address
          </Button>
        }
      />

      {error && <ErrorState message={error} onRetry={fetchAddresses} />}

      {loading ? (
        <LoadingState message="Loading addresses..." />
      ) : addresses.length === 0 ? (
        <EmptyState
          message="No addresses found"
          description="Create a delivery address to begin placing orders."
        />
      ) : (
        <Grid container spacing={3}>
          {addresses.map((addr) => (
            <Grid item xs={12} sm={6} md={4} key={addr.id}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  border: addr.isDefault ? "2px solid #00843D" : "1px solid #e9ecef",
                  position: "relative",
                }}
              >
                <CardContent sx={{ pb: 1 }}>
                  {addr.isDefault && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: 10,
                        right: 10,
                        color: "primary.main",
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        bgcolor: "rgba(0, 132, 61, 0.08)",
                        px: 1,
                        py: 0.25,
                        borderRadius: 1,
                      }}
                    >
                      <CheckCircleIcon fontSize="small" />
                      <Typography variant="caption" fontWeight={700}>
                        Default
                      </Typography>
                    </Box>
                  )}

                  <Stack spacing={1} sx={{ pt: addr.isDefault ? 2 : 0 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <LocationOnIcon color="action" fontSize="small" />
                      <Typography variant="subtitle1" fontWeight={750}>
                        {addr.receiverName}
                      </Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary" fontWeight={600}>
                      Phone: {addr.phoneNumber}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ minHeight: 40 }}>
                      {addr.addressLine}, {addr.ward}, {addr.district}, {addr.city}
                    </Typography>
                  </Stack>
                </CardContent>

                <CardActions sx={{ px: 2, pb: 2, justifyContent: "space-between", flexWrap: "wrap", gap: 1 }}>
                  <Box>
                    <IconButton size="small" color="primary" onClick={() => handleOpenEdit(addr)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => handleOpenDelete(addr.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>

                  {!addr.isDefault && (
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleSetDefault(addr.id)}
                    >
                      Set Default
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <Box component="form" onSubmit={handleFormSubmit}>
          <DialogTitle>{currentAddress ? "Edit Delivery Address" : "Add Delivery Address"}</DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 1 }}>
              {submitError && <Alert severity="error">{submitError}</Alert>}

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Receiver Name"
                    fullWidth
                    required
                    value={receiverName}
                    onChange={(e) => {
                      setReceiverName(e.target.value);
                      if (errors.receiverName) setErrors({ ...errors, receiverName: "" });
                    }}
                    error={!!errors.receiverName}
                    helperText={errors.receiverName}
                    disabled={submitLoading}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Phone Number"
                    fullWidth
                    required
                    value={phoneNumber}
                    onChange={(e) => {
                      setPhoneNumber(e.target.value);
                      if (errors.phoneNumber) setErrors({ ...errors, phoneNumber: "" });
                    }}
                    error={!!errors.phoneNumber}
                    helperText={errors.phoneNumber}
                    disabled={submitLoading}
                  />
                </Grid>
              </Grid>

              <TextField
                label="Street Address Line"
                fullWidth
                required
                value={addressLine}
                onChange={(e) => {
                  setAddressLine(e.target.value);
                  if (errors.addressLine) setErrors({ ...errors, addressLine: "" });
                }}
                error={!!errors.addressLine}
                helperText={errors.addressLine}
                disabled={submitLoading}
              />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Ward"
                    fullWidth
                    required
                    value={ward}
                    onChange={(e) => {
                      setWard(e.target.value);
                      if (errors.ward) setErrors({ ...errors, ward: "" });
                    }}
                    error={!!errors.ward}
                    helperText={errors.ward}
                    disabled={submitLoading}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="District"
                    fullWidth
                    required
                    value={district}
                    onChange={(e) => {
                      setDistrict(e.target.value);
                      if (errors.district) setErrors({ ...errors, district: "" });
                    }}
                    error={!!errors.district}
                    helperText={errors.district}
                    disabled={submitLoading}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="City"
                    fullWidth
                    required
                    value={city}
                    onChange={(e) => {
                      setCity(e.target.value);
                      if (errors.city) setErrors({ ...errors, city: "" });
                    }}
                    error={!!errors.city}
                    helperText={errors.city}
                    disabled={submitLoading}
                  />
                </Grid>
              </Grid>

              <FormControlLabel
                control={
                  <Checkbox
                    checked={isDefault}
                    onChange={(e) => setIsDefault(e.target.checked)}
                    disabled={submitLoading}
                  />
                }
                label="Set as default delivery address"
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={handleDialogClose} disabled={submitLoading}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={submitLoading}>
              {currentAddress ? "Save Changes" : "Create"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteOpen}
        title="Delete Address"
        message="Are you sure you want to delete this delivery address? This action cannot be undone."
        confirmText="Delete"
        loading={deleteLoading}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteOpen(false)}
      />
    </div>
  );
};

export default AddressPage;
