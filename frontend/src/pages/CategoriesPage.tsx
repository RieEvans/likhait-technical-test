import React, { useEffect, useState } from "react";
import {
  createCategory,
  deleteCategory,
  fetchCategories,
  updateCategory,
} from "../services/api";
import { Category } from "../types";
import { Button, Modal } from "../vibes";
import { CategoryForm } from "../components/CategoryForm";
import { COLORS } from "../constants/colors";

const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await fetchCategories();
      setCategories(data);
    } catch (loadError) {
      console.error("Error fetching categories:", loadError);
      setError("Failed to load categories.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async (name: string) => {
    const createdCategory = await createCategory(name);
    setCategories((prev) =>
      [ ...prev, createdCategory ].sort((a, b) => a.name.localeCompare(b.name)),
    );
    setIsCreateModalOpen(false);
    setError("");
  };

  const handleUpdateCategory = async (name: string) => {
    if (!editingCategory) return;

    const updatedCategory = await updateCategory(editingCategory.id, name);
    setCategories((prev) =>
      prev
        .map((category) =>
          category.id === updatedCategory.id ? updatedCategory : category,
        )
        .sort((a, b) => a.name.localeCompare(b.name)),
    );
    setEditingCategory(null);
    setError("");
  };

  const handleDeleteCategory = async () => {
    if (!deletingCategory) return;
    try {
      await deleteCategory(deletingCategory.id);
      setCategories((prev) =>
        prev.filter((category) => category.id !== deletingCategory.id),
      );
      setDeletingCategory(null);
      setError("");
    } catch (deleteError) {
      const message =
        deleteError instanceof Error
          ? deleteError.message
          : "Failed to delete category";
      setError(message);
    }
  };

  const pageStyle: React.CSSProperties = {
    padding: "48px 64px",
    minHeight: "100vh",
    background: COLORS.secondary.s01,
  };

  const headerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "24px",
    marginBottom: "32px",
  };

  const titleBlockStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  };

  const titleStyle: React.CSSProperties = {
    fontSize: "40px",
    fontWeight: 700,
    color: COLORS.secondary.s10,
    margin: 0,
  };

  const subtitleStyle: React.CSSProperties = {
    margin: 0,
    fontSize: "16px",
    color: COLORS.secondary.s08,
  };

  const cardStyle: React.CSSProperties = {
    background: COLORS.background.main,
    border: `1px solid ${COLORS.border}`,
    borderRadius: "12px",
    overflow: "hidden",
  };

  const messageStyle: React.CSSProperties = {
    padding: "16px 20px",
    color: COLORS.danger,
    background: COLORS.red.re02,
    borderBottom: `1px solid ${COLORS.border}`,
  };

  const tableStyle: React.CSSProperties = {
    width: "100%",
    borderCollapse: "collapse",
  };

  const thStyle: React.CSSProperties = {
    padding: "16px 20px",
    textAlign: "left",
    fontWeight: 600,
    color: COLORS.text.primary,
    background: COLORS.background.card,
    borderBottom: `1px solid ${COLORS.border}`,
  };

  const tdStyle: React.CSSProperties = {
    padding: "16px 20px",
    borderBottom: `1px solid ${COLORS.border}`,
    color: COLORS.text.primary,
  };

  const actionsStyle: React.CSSProperties = {
    display: "flex",
    gap: "8px",
  };

  const emptyStyle: React.CSSProperties = {
    padding: "48px",
    textAlign: "center",
    color: COLORS.text.secondary,
  };

  const loadingStyle: React.CSSProperties = {
    padding: "48px",
    textAlign: "center",
    color: COLORS.text.secondary,
  };

  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <div style={titleBlockStyle}>
          <h1 style={titleStyle}>Category Management</h1>
          <p style={subtitleStyle}>
            Create, rename, and remove expense categories from one place.
          </p>
        </div>
        <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
          Add Category
        </Button>
      </div>

      <div style={cardStyle}>
        {error && <div style={messageStyle}>{error}</div>}

        {loading ? (
          <div style={loadingStyle}>Loading categories...</div>
        ) : categories.length === 0 ? (
          <div style={emptyStyle}>
            No categories found. Create your first category to get started.
          </div>
        ) : (
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Category Name</th>
                <th style={{ ...thStyle, width: "180px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id}>
                  <td style={tdStyle}>{category.name}</td>
                  <td style={tdStyle}>
                    <div style={actionsStyle}>
                      <Button
                        variant="secondary"
                        size="small"
                        onClick={() => setEditingCategory(category)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        size="small"
                        onClick={() => setDeletingCategory(category)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Add New Category"
      >
        <CategoryForm
          onSubmit={handleCreateCategory}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={editingCategory !== null}
        onClose={() => setEditingCategory(null)}
        title="Edit Category"
      >
        {editingCategory && (
          <CategoryForm
            initialName={editingCategory.name}
            onSubmit={handleUpdateCategory}
            onCancel={() => setEditingCategory(null)}
            submitLabel="Update Category"
          />
        )}
      </Modal>

      <Modal isOpen={deletingCategory !== null} onClose={() => setDeletingCategory(null)} title="Delete Category" >
        {deletingCategory && (
          <div style={{ padding: "8px 0" }}>
            <p style={{ marginTop: 0, marginBottom: "16px", color: COLORS.text.primary }}>
              Are you sure you want to delete <strong>{deletingCategory.name}</strong>?
            </p>
            <p style={{ marginTop: 0, marginBottom: "24px", color: COLORS.text.secondary }}>
              Categories with linked expenses cannot be deleted until those expenses are reassigned or removed.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px"}} >
              <Button variant="secondary" onClick={() => setDeletingCategory(null)} >
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDeleteCategory}>
                Delete
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CategoriesPage;
