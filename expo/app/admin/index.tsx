import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
  RefreshControl,
  Modal,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Ban,
  RotateCcw,
  Clock,
  Search,
  ChevronRight,
  MapPin,
  Phone,
  Mail,
  Star,
  Building2,
  X,
  FileText,
  Image as ImageIcon,
  Shield,
} from "lucide-react-native";
import { router } from "expo-router";
import { trpc } from "@/lib/trpc";
import type { Vendor, VendorStatus } from "@/types/vendor";

const { width: screenWidth } = Dimensions.get("window");

const statusConfig: Record<
  VendorStatus,
  { color: string; bg: string; label: string; icon: typeof Clock }
> = {
  pending: {
    color: "#F59E0B",
    bg: "#FEF3C7",
    label: "Pending",
    icon: Clock,
  },
  approved: {
    color: "#10B981",
    bg: "#D1FAE5",
    label: "Approved",
    icon: CheckCircle2,
  },
  rejected: {
    color: "#EF4444",
    bg: "#FEE2E2",
    label: "Rejected",
    icon: XCircle,
  },
  suspended: {
    color: "#6B7280",
    bg: "#E5E7EB",
    label: "Suspended",
    icon: Ban,
  },
};

type FilterTab = "all" | VendorStatus;

export default function AdminDashboardScreen() {
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectVendorId, setRejectVendorId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showSuspendConfirm, setShowSuspendConfirm] = useState<string | null>(
    null
  );
  const [showReactivateConfirm, setShowReactivateConfirm] = useState<
    string | null
  >(null);

  const adminListQuery = trpc.vendors.adminList.useQuery(
    { status: activeFilter, limit: 100 },
    {
      refetchOnWindowFocus: true,
      staleTime: 30 * 1000,
    }
  );

  const approveMutation = trpc.vendors.approve.useMutation({
    onSuccess: (data) => {
      Alert.alert("Vendor Approved", data.message);
      adminListQuery.refetch();
    },
    onError: (error) => {
      Alert.alert(
        "Approval Failed",
        error.message || "Failed to approve vendor"
      );
    },
  });

  const rejectMutation = trpc.vendors.reject.useMutation({
    onSuccess: (data) => {
      Alert.alert("Vendor Rejected", data.message);
      setShowRejectModal(false);
      setRejectVendorId(null);
      setRejectionReason("");
      adminListQuery.refetch();
    },
    onError: (error) => {
      Alert.alert(
        "Rejection Failed",
        error.message || "Failed to reject vendor"
      );
    },
  });

  const suspendMutation = trpc.vendors.suspend.useMutation({
    onSuccess: (data) => {
      Alert.alert("Vendor Suspended", data.message);
      setShowSuspendConfirm(null);
      adminListQuery.refetch();
    },
    onError: (error) => {
      Alert.alert(
        "Suspension Failed",
        error.message || "Failed to suspend vendor"
      );
    },
  });

  const reactivateMutation = trpc.vendors.reactivate.useMutation({
    onSuccess: (data) => {
      Alert.alert("Vendor Reactivated", data.message);
      setShowReactivateConfirm(null);
      adminListQuery.refetch();
    },
    onError: (error) => {
      Alert.alert(
        "Reactivation Failed",
        error.message || "Failed to reactivate vendor"
      );
    },
  });

  const counts = adminListQuery.data?.counts;

  const filteredVendors = useMemo(() => {
    let vendors = adminListQuery.data?.vendors || [];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      vendors = vendors.filter(
        (v) =>
          v.name.toLowerCase().includes(q) ||
          v.email.toLowerCase().includes(q) ||
          v.owner_name?.toLowerCase().includes(q) ||
          v.city.toLowerCase().includes(q)
      );
    }
    return vendors;
  }, [adminListQuery.data, searchQuery]);

  const handleApprove = (vendor: Vendor) => {
    Alert.alert(
      "Approve Vendor",
      `Are you sure you want to approve "${vendor.name}"?\n\nThey will be able to access the vendor dashboard, add products, and receive customer orders.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Approve",
          onPress: () => approveMutation.mutate({ vendorId: vendor.id }),
        },
      ]
    );
  };

  const handleReject = (vendor: Vendor) => {
    setRejectVendorId(vendor.id);
    setRejectionReason("");
    setShowRejectModal(true);
  };

  const submitRejection = () => {
    if (!rejectionReason.trim()) {
      Alert.alert("Error", "Please enter a rejection reason");
      return;
    }
    if (rejectVendorId) {
      rejectMutation.mutate({
        vendorId: rejectVendorId,
        rejectionReason: rejectionReason.trim(),
      });
    }
  };

  const handleSuspend = (vendor: Vendor) => {
    setShowSuspendConfirm(vendor.id);
  };

  const confirmSuspend = () => {
    if (showSuspendConfirm) {
      suspendMutation.mutate({ vendorId: showSuspendConfirm });
    }
  };

  const handleReactivate = (vendor: Vendor) => {
    setShowReactivateConfirm(vendor.id);
  };

  const confirmReactivate = () => {
    if (showReactivateConfirm) {
      reactivateMutation.mutate({ vendorId: showReactivateConfirm });
    }
  };

  const renderStatusBadge = (status: VendorStatus) => {
    const config = statusConfig[status];
    const Icon = config.icon;
    return (
      <View style={[styles.statusBadge, { backgroundColor: config.bg }]}>
        <Icon size={12} color={config.color} />
        <Text style={[styles.statusText, { color: config.color }]}>
          {config.label}
        </Text>
      </View>
    );
  };

  const renderFilterTab = (
    tab: FilterTab,
    label: string,
    count?: number
  ) => (
    <TouchableOpacity
      style={[
        styles.filterTab,
        activeFilter === tab && styles.filterTabActive,
      ]}
      onPress={() => setActiveFilter(tab)}
    >
      <Text
        style={[
          styles.filterTabText,
          activeFilter === tab && styles.filterTabTextActive,
        ]}
      >
        {label}
      </Text>
      {count !== undefined && count > 0 && (
        <View
          style={[
            styles.filterCount,
            activeFilter === tab && styles.filterCountActive,
          ]}
        >
          <Text
            style={[
              styles.filterCountText,
              activeFilter === tab && styles.filterCountTextActive,
            ]}
          >
            {count}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderVendorRow = (vendor: Vendor) => {
    const status = vendor.status;
    return (
      <View key={vendor.id} style={styles.vendorCard}>
        <View style={styles.vendorCardHeader}>
          <Image
            source={{
              uri:
                vendor.logo ||
                "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=100",
            }}
            style={styles.vendorLogo}
          />
          <View style={styles.vendorInfo}>
            <Text style={styles.vendorName} numberOfLines={1}>
              {vendor.name}
            </Text>
            <Text style={styles.vendorOwner} numberOfLines={1}>
              {vendor.owner_name || "N/A"}
            </Text>
            <View style={styles.vendorMetaRow}>
              <MapPin size={12} color="#8E8E93" />
              <Text style={styles.vendorMeta} numberOfLines={1}>
                {vendor.city}
              </Text>
            </View>
            <View style={styles.vendorMetaRow}>
              <Text style={styles.vendorCategory}>
                {vendor.business_category}
              </Text>
            </View>
          </View>
          {renderStatusBadge(status)}
        </View>

        {vendor.business_description && (
          <Text style={styles.vendorDescription} numberOfLines={2}>
            {vendor.business_description}
          </Text>
        )}

        {/* Contact info */}
        <View style={styles.contactRow}>
          <View style={styles.contactItem}>
            <Mail size={14} color="#8E8E93" />
            <Text style={styles.contactText} numberOfLines={1}>
              {vendor.email}
            </Text>
          </View>
          <View style={styles.contactItem}>
            <Phone size={14} color="#8E8E93" />
            <Text style={styles.contactText} numberOfLines={1}>
              {vendor.phone}
            </Text>
          </View>
        </View>

        {/* Image count indicator */}
        {(vendor.gallery_images?.length || 0) > 0 ||
        vendor.cover_image ||
        (vendor.documents?.business_registration ||
          vendor.documents?.food_license) ? (
          <View style={styles.imageIndicators}>
            {vendor.logo && (
              <View style={styles.imageIndicator}>
                <ImageIcon size={12} color="#FF6B35" />
                <Text style={styles.imageIndicatorText}>Logo</Text>
              </View>
            )}
            {vendor.cover_image && (
              <View style={styles.imageIndicator}>
                <ImageIcon size={12} color="#FF6B35" />
                <Text style={styles.imageIndicatorText}>Cover</Text>
              </View>
            )}
            {(vendor.gallery_images?.length || 0) > 0 && (
              <View style={styles.imageIndicator}>
                <ImageIcon size={12} color="#FF6B35" />
                <Text style={styles.imageIndicatorText}>
                  {vendor.gallery_images!.length} Photos
                </Text>
              </View>
            )}
            {(vendor.documents?.business_registration ||
              vendor.documents?.food_license) && (
              <View style={styles.imageIndicator}>
                <FileText size={12} color="#FF6B35" />
                <Text style={styles.imageIndicatorText}>Documents</Text>
              </View>
            )}
          </View>
        ) : null}

        {/* Admin notes */}
        {vendor.admin_notes && (
          <View style={styles.adminNotesBox}>
            <Text style={styles.adminNotesLabel}>Admin Notes:</Text>
            <Text style={styles.adminNotesText}>{vendor.admin_notes}</Text>
          </View>
        )}

        {vendor.rejection_reason && (
          <View style={styles.rejectionBox}>
            <Text style={styles.rejectionLabel}>Rejection Reason:</Text>
            <Text style={styles.rejectionText}>
              {vendor.rejection_reason}
            </Text>
          </View>
        )}

        {/* Action buttons */}
        <View style={styles.actionRow}>
          {/* Approve - show for pending, rejected */}
          {(status === "pending" || status === "rejected") && (
            <TouchableOpacity
              style={[styles.actionButton, styles.approveButton]}
              onPress={() => handleApprove(vendor)}
              disabled={approveMutation.isPending}
            >
              <CheckCircle2 size={16} color="white" />
              <Text style={styles.actionButtonText}>Approve</Text>
            </TouchableOpacity>
          )}

          {/* Reject - show for pending, approved */}
          {(status === "pending" || status === "approved") && (
            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              onPress={() => handleReject(vendor)}
              disabled={rejectMutation.isPending}
            >
              <XCircle size={16} color="white" />
              <Text style={styles.actionButtonText}>Reject</Text>
            </TouchableOpacity>
          )}

          {/* Suspend - show for approved */}
          {status === "approved" && (
            <TouchableOpacity
              style={[styles.actionButton, styles.suspendButton]}
              onPress={() => handleSuspend(vendor)}
              disabled={suspendMutation.isPending}
            >
              <Ban size={16} color="white" />
              <Text style={styles.actionButtonText}>Suspend</Text>
            </TouchableOpacity>
          )}

          {/* Reactivate - show for suspended, rejected */}
          {(status === "suspended" || status === "rejected") && (
            <TouchableOpacity
              style={[styles.actionButton, styles.reactivateButton]}
              onPress={() => handleReactivate(vendor)}
              disabled={reactivateMutation.isPending}
            >
              <RotateCcw size={16} color="white" />
              <Text style={styles.actionButtonText}>Reactivate</Text>
            </TouchableOpacity>
          )}

          {/* View details */}
          <TouchableOpacity
            style={styles.viewButton}
            onPress={() => setSelectedVendor(vendor)}
          >
            <Text style={styles.viewButtonText}>Details</Text>
            <ChevronRight size={14} color="#FF6B35" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderVendorDetailModal = () => {
    if (!selectedVendor) return null;
    const vendor = selectedVendor;
    return (
      <Modal
        visible={!!selectedVendor}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedVendor(null)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Vendor Details</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setSelectedVendor(null)}
            >
              <X size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.modalContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Cover & Logo */}
            {vendor.cover_image && (
              <Image
                source={{ uri: vendor.cover_image }}
                style={styles.modalCoverImage}
              />
            )}
            <View style={styles.modalLogoSection}>
              <Image
                source={{
                  uri:
                    vendor.logo ||
                    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200",
                }}
                style={styles.modalLogo}
              />
              <View style={styles.modalTitleSection}>
                <Text style={styles.modalVendorName}>{vendor.name}</Text>
                <Text style={styles.modalVendorOwner}>
                  {vendor.owner_name}
                </Text>
                {renderStatusBadge(vendor.status)}
              </View>
            </View>

            {/* Business Info */}
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Business Information</Text>
              <View style={styles.modalInfoRow}>
                <Building2 size={16} color="#8E8E93" />
                <Text style={styles.modalInfoLabel}>Category:</Text>
                <Text style={styles.modalInfoValue}>
                  {vendor.business_category}
                </Text>
              </View>
              <View style={styles.modalInfoRow}>
                <Star size={16} color="#8E8E93" />
                <Text style={styles.modalInfoLabel}>Cuisine:</Text>
                <Text style={styles.modalInfoValue}>{vendor.cuisine_type}</Text>
              </View>
              {vendor.business_description && (
                <View style={styles.modalDescriptionBox}>
                  <Text style={styles.modalDescription}>
                    {vendor.business_description}
                  </Text>
                </View>
              )}
            </View>

            {/* Contact Info */}
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Contact Information</Text>
              <View style={styles.modalInfoRow}>
                <Mail size={16} color="#8E8E93" />
                <Text style={styles.modalInfoValue}>{vendor.email}</Text>
              </View>
              <View style={styles.modalInfoRow}>
                <Phone size={16} color="#8E8E93" />
                <Text style={styles.modalInfoValue}>{vendor.phone}</Text>
              </View>
              <View style={styles.modalInfoRow}>
                <MapPin size={16} color="#8E8E93" />
                <Text style={styles.modalInfoValue}>
                  {vendor.address}, {vendor.city}
                </Text>
              </View>
            </View>

            {/* Gallery */}
            {vendor.gallery_images && vendor.gallery_images.length > 0 && (
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>
                  Business Photos ({vendor.gallery_images.length})
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {vendor.gallery_images.map((img, idx) => (
                    <Image
                      key={idx}
                      source={{ uri: img }}
                      style={styles.modalGalleryImage}
                    />
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Documents */}
            {vendor.documents &&
              (vendor.documents.business_registration ||
                vendor.documents.food_license) && (
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Documents</Text>
                  <View style={styles.modalDocumentsRow}>
                    {vendor.documents.business_registration && (
                      <View style={styles.modalDocumentItem}>
                        <Image
                          source={{
                            uri: vendor.documents.business_registration,
                          }}
                          style={styles.modalDocumentImage}
                        />
                        <Text style={styles.modalDocumentLabel}>
                          Business Registration
                        </Text>
                      </View>
                    )}
                    {vendor.documents.food_license && (
                      <View style={styles.modalDocumentItem}>
                        <Image
                          source={{ uri: vendor.documents.food_license }}
                          style={styles.modalDocumentImage}
                        />
                        <Text style={styles.modalDocumentLabel}>
                          Food License
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              )}

            {/* Dates */}
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Timeline</Text>
              <View style={styles.modalInfoRow}>
                <Clock size={16} color="#8E8E93" />
                <Text style={styles.modalInfoLabel}>Applied:</Text>
                <Text style={styles.modalInfoValue}>
                  {new Date(vendor.created_at).toLocaleDateString()}
                </Text>
              </View>
              {vendor.approved_at && (
                <View style={styles.modalInfoRow}>
                  <CheckCircle2 size={16} color="#10B981" />
                  <Text style={styles.modalInfoLabel}>Approved:</Text>
                  <Text style={styles.modalInfoValue}>
                    {new Date(vendor.approved_at).toLocaleDateString()}
                  </Text>
                </View>
              )}
              {vendor.rejected_at && (
                <View style={styles.modalInfoRow}>
                  <XCircle size={16} color="#EF4444" />
                  <Text style={styles.modalInfoLabel}>Rejected:</Text>
                  <Text style={styles.modalInfoValue}>
                    {new Date(vendor.rejected_at).toLocaleDateString()}
                  </Text>
                </View>
              )}
              {vendor.suspended_at && (
                <View style={styles.modalInfoRow}>
                  <Ban size={16} color="#6B7280" />
                  <Text style={styles.modalInfoLabel}>Suspended:</Text>
                  <Text style={styles.modalInfoValue}>
                    {new Date(vendor.suspended_at).toLocaleDateString()}
                  </Text>
                </View>
              )}
            </View>

            {/* Admin notes */}
            {vendor.admin_notes && (
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Admin Notes</Text>
                <View style={styles.modalNotesBox}>
                  <Text style={styles.modalNotesText}>
                    {vendor.admin_notes}
                  </Text>
                </View>
              </View>
            )}

            {vendor.rejection_reason && (
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Rejection Reason</Text>
                <View style={styles.modalRejectionBox}>
                  <Text style={styles.modalRejectionText}>
                    {vendor.rejection_reason}
                  </Text>
                </View>
              </View>
            )}

            {/* Action buttons in modal */}
            <View style={styles.modalActions}>
              {(vendor.status === "pending" || vendor.status === "rejected") && (
                <TouchableOpacity
                  style={[styles.modalActionButton, styles.approveButton]}
                  onPress={() => {
                    handleApprove(vendor);
                    setSelectedVendor(null);
                  }}
                >
                  <CheckCircle2 size={18} color="white" />
                  <Text style={styles.modalActionButtonText}>
                    Approve Vendor
                  </Text>
                </TouchableOpacity>
              )}
              {(vendor.status === "pending" || vendor.status === "approved") && (
                <TouchableOpacity
                  style={[styles.modalActionButton, styles.rejectButton]}
                  onPress={() => {
                    handleReject(vendor);
                    setSelectedVendor(null);
                  }}
                >
                  <XCircle size={18} color="white" />
                  <Text style={styles.modalActionButtonText}>
                    Reject Vendor
                  </Text>
                </TouchableOpacity>
              )}
              {vendor.status === "approved" && (
                <TouchableOpacity
                  style={[styles.modalActionButton, styles.suspendButton]}
                  onPress={() => {
                    handleSuspend(vendor);
                    setSelectedVendor(null);
                  }}
                >
                  <Ban size={18} color="white" />
                  <Text style={styles.modalActionButtonText}>
                    Suspend Vendor
                  </Text>
                </TouchableOpacity>
              )}
              {(vendor.status === "suspended" ||
                vendor.status === "rejected") && (
                <TouchableOpacity
                  style={[
                    styles.modalActionButton,
                    styles.reactivateButton,
                  ]}
                  onPress={() => {
                    handleReactivate(vendor);
                    setSelectedVendor(null);
                  }}
                >
                  <RotateCcw size={18} color="white" />
                  <Text style={styles.modalActionButtonText}>
                    Reactivate Vendor
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    );
  };

  const renderRejectModal = () => (
    <Modal
      visible={showRejectModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowRejectModal(false)}
    >
      <View style={styles.overlay}>
        <View style={styles.rejectModal}>
          <Text style={styles.rejectModalTitle}>Reject Vendor Application</Text>
          <Text style={styles.rejectModalSubtitle}>
            Please provide a reason for rejection. This will be sent to the
            vendor.
          </Text>
          <TextInput
            style={[styles.rejectInput, styles.rejectTextArea]}
            value={rejectionReason}
            onChangeText={setRejectionReason}
            placeholder="Enter rejection reason..."
            multiline
            numberOfLines={4}
            autoFocus
            placeholderTextColor="#8E8E93"
          />
          <View style={styles.rejectModalActions}>
            <TouchableOpacity
              style={styles.rejectCancelButton}
              onPress={() => {
                setShowRejectModal(false);
                setRejectVendorId(null);
                setRejectionReason("");
              }}
            >
              <Text style={styles.rejectCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.rejectConfirmButton,
                !rejectionReason.trim() &&
                  styles.rejectConfirmButtonDisabled,
              ]}
              onPress={submitRejection}
              disabled={
                !rejectionReason.trim() || rejectMutation.isPending
              }
            >
              {rejectMutation.isPending ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.rejectConfirmText}>Confirm Rejection</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderConfirmModal = (
    visible: boolean,
    title: string,
    message: string,
    confirmText: string,
    onConfirm: () => void,
    confirmColor: string,
    isLoading: boolean
  ) => (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => {}}
    >
      <View style={styles.overlay}>
        <View style={styles.confirmModal}>
          <Text style={styles.confirmModalTitle}>{title}</Text>
          <Text style={styles.confirmModalMessage}>{message}</Text>
          <View style={styles.confirmModalActions}>
            <TouchableOpacity
              style={styles.confirmCancelButton}
              onPress={() => {
                setShowSuspendConfirm(null);
                setShowReactivateConfirm(null);
              }}
            >
              <Text style={styles.confirmCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmButton, { backgroundColor: confirmColor }]}
              onPress={onConfirm}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.confirmText}>{confirmText}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Shield size={20} color="#FF6B35" />
          <Text style={styles.headerTitle}>Admin Dashboard</Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={18} color="#8E8E93" />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search by name, email, owner, city..."
            placeholderTextColor="#8E8E93"
          />
        </View>
      </View>

      {/* Status filter tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {renderFilterTab("all", "All", counts?.all)}
        {renderFilterTab("pending", "Pending", counts?.pending)}
        {renderFilterTab("approved", "Approved", counts?.approved)}
        {renderFilterTab("rejected", "Rejected", counts?.rejected)}
        {renderFilterTab("suspended", "Suspended", counts?.suspended)}
      </ScrollView>

      {/* Vendor list */}
      <ScrollView
        style={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={adminListQuery.isLoading}
            onRefresh={() => adminListQuery.refetch()}
            colors={["#FF6B35"]}
            tintColor="#FF6B35"
          />
        }
      >
        {adminListQuery.isLoading && !adminListQuery.data ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF6B35" />
            <Text style={styles.loadingText}>Loading vendors...</Text>
          </View>
        ) : filteredVendors.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Building2 size={48} color="#E5E5EA" />
            <Text style={styles.emptyTitle}>No vendors found</Text>
            <Text style={styles.emptyText}>
              {searchQuery
                ? "Try adjusting your search query"
                : activeFilter === "all"
                ? "No vendor applications yet"
                : `No ${activeFilter} vendors`}
            </Text>
          </View>
        ) : (
          <View style={styles.vendorList}>
            {filteredVendors.map((vendor) => renderVendorRow(vendor))}
          </View>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Modals */}
      {renderVendorDetailModal()}
      {renderRejectModal()}
      {renderConfirmModal(
        showSuspendConfirm !== null,
        "Suspend Vendor",
        "This vendor will be temporarily disabled. They won't be able to receive orders, but their data will be preserved. You can reactivate them anytime.",
        "Suspend",
        confirmSuspend,
        "#6B7280",
        suspendMutation.isPending
      )}
      {renderConfirmModal(
        showReactivateConfirm !== null,
        "Reactivate Vendor",
        "This vendor will be reactivated and can access their dashboard and receive orders again.",
        "Reactivate",
        confirmReactivate,
        "#10B981",
        reactivateMutation.isPending
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F7",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F2F2F7",
    justifyContent: "center",
    alignItems: "center",
  },
  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  placeholder: {
    width: 40,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F7",
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F2F2F7",
    borderRadius: 12,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: "#333",
  },
  filterContainer: {
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F7",
  },
  filterContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterTab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F2F2F7",
    gap: 6,
  },
  filterTabActive: {
    backgroundColor: "#FF6B35",
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#555",
  },
  filterTabTextActive: {
    color: "white",
    fontWeight: "600",
  },
  filterCount: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#E5E5EA",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  filterCountActive: {
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  filterCountText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#555",
  },
  filterCountTextActive: {
    color: "white",
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 80,
  },
  loadingText: {
    fontSize: 16,
    color: "#8E8E93",
    marginTop: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#555",
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: "#8E8E93",
    marginTop: 8,
    textAlign: "center",
  },
  vendorList: {
    gap: 12,
  },
  vendorCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F2F2F7",
  },
  vendorCardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  vendorLogo: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: "#F2F2F7",
  },
  vendorInfo: {
    flex: 1,
    gap: 3,
  },
  vendorName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  vendorOwner: {
    fontSize: 14,
    color: "#8E8E93",
  },
  vendorMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  vendorMeta: {
    fontSize: 13,
    color: "#8E8E93",
  },
  vendorCategory: {
    fontSize: 12,
    color: "#FF6B35",
    fontWeight: "500",
    backgroundColor: "#FFF5F0",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    overflow: "hidden",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  vendorDescription: {
    fontSize: 13,
    color: "#666",
    marginTop: 10,
    lineHeight: 18,
  },
  contactRow: {
    flexDirection: "row",
    gap: 16,
    marginTop: 10,
    flexWrap: "wrap",
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  contactText: {
    fontSize: 13,
    color: "#666",
    maxWidth: 140,
  },
  imageIndicators: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 10,
  },
  imageIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FFF5F0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  imageIndicatorText: {
    fontSize: 12,
    color: "#FF6B35",
    fontWeight: "500",
  },
  adminNotesBox: {
    marginTop: 10,
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: "#6B7280",
  },
  adminNotesLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 4,
  },
  adminNotesText: {
    fontSize: 13,
    color: "#555",
  },
  rejectionBox: {
    marginTop: 10,
    backgroundColor: "#FEE2E2",
    borderRadius: 8,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: "#EF4444",
  },
  rejectionLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#EF4444",
    marginBottom: 4,
  },
  rejectionText: {
    fontSize: 13,
    color: "#B91C1C",
  },
  actionRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 14,
    flexWrap: "wrap",
    alignItems: "center",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  approveButton: {
    backgroundColor: "#10B981",
  },
  rejectButton: {
    backgroundColor: "#EF4444",
  },
  suspendButton: {
    backgroundColor: "#6B7280",
  },
  reactivateButton: {
    backgroundColor: "#3B82F6",
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "white",
  },
  viewButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#FF6B35",
    gap: 4,
    marginLeft: "auto",
  },
  viewButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#FF6B35",
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F7",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F2F2F7",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  modalCoverImage: {
    width: "100%",
    height: 160,
    borderRadius: 16,
    marginBottom: 16,
    resizeMode: "cover",
  },
  modalLogoSection: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 24,
  },
  modalLogo: {
    width: 72,
    height: 72,
    borderRadius: 16,
    backgroundColor: "#F2F2F7",
  },
  modalTitleSection: {
    flex: 1,
    gap: 4,
  },
  modalVendorName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  modalVendorOwner: {
    fontSize: 15,
    color: "#8E8E93",
    marginBottom: 4,
  },
  modalSection: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F2F2F7",
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  modalInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  modalInfoLabel: {
    fontSize: 14,
    color: "#8E8E93",
    fontWeight: "500",
  },
  modalInfoValue: {
    fontSize: 14,
    color: "#333",
    flex: 1,
  },
  modalDescriptionBox: {
    marginTop: 8,
    backgroundColor: "#F8F9FA",
    borderRadius: 10,
    padding: 12,
  },
  modalDescription: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
  },
  modalGalleryImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
    marginRight: 8,
    resizeMode: "cover",
  },
  modalDocumentsRow: {
    flexDirection: "row",
    gap: 12,
  },
  modalDocumentItem: {
    alignItems: "center",
    gap: 6,
  },
  modalDocumentImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
    resizeMode: "cover",
  },
  modalDocumentLabel: {
    fontSize: 12,
    color: "#8E8E93",
    fontWeight: "500",
  },
  modalNotesBox: {
    backgroundColor: "#F8F9FA",
    borderRadius: 10,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: "#6B7280",
  },
  modalNotesText: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
  },
  modalRejectionBox: {
    backgroundColor: "#FEE2E2",
    borderRadius: 10,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: "#EF4444",
  },
  modalRejectionText: {
    fontSize: 14,
    color: "#B91C1C",
    lineHeight: 20,
  },
  modalActions: {
    gap: 12,
    marginBottom: 20,
  },
  modalActionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  modalActionButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "white",
  },
  // Reject modal
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  rejectModal: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 400,
  },
  rejectModalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  rejectModalSubtitle: {
    fontSize: 14,
    color: "#8E8E93",
    marginBottom: 16,
    lineHeight: 20,
  },
  rejectInput: {
    backgroundColor: "#F8F9FA",
    borderWidth: 1,
    borderColor: "#E5E5EA",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: "#333",
    marginBottom: 16,
  },
  rejectTextArea: {
    height: 100,
    textAlignVertical: "top",
  },
  rejectModalActions: {
    flexDirection: "row",
    gap: 12,
  },
  rejectCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E5EA",
    alignItems: "center",
  },
  rejectCancelText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#555",
  },
  rejectConfirmButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#EF4444",
    alignItems: "center",
  },
  rejectConfirmButtonDisabled: {
    opacity: 0.5,
  },
  rejectConfirmText: {
    fontSize: 15,
    fontWeight: "600",
    color: "white",
  },
  // Confirm modal (suspend/reactivate)
  confirmModal: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 400,
  },
  confirmModalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  confirmModalMessage: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 20,
  },
  confirmModalActions: {
    flexDirection: "row",
    gap: 12,
  },
  confirmCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E5EA",
    alignItems: "center",
  },
  confirmCancelText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#555",
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  confirmText: {
    fontSize: 15,
    fontWeight: "600",
    color: "white",
  },
});
