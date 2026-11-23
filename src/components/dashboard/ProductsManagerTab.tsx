"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  ShoppingBag,
  Download,
  Heart,
  Sparkles,
  Edit2,
  Trash2,
  GripVertical,
  Check,
  AlertCircle,
  ExternalLink,
  Loader2,
  X,
  FileText,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Toggle } from "@/components/ui/Toggle";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import ImageUpload from "@/components/ui/ImageUpload";
import { Modal } from "@/components/ui/Modal";
import { getMaxActiveProducts } from "@/lib/billing/entitlements";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Product {
  id: string;
  title: string;
  description?: string | null;
  priceInCents: number;
  currency: string;
  type: "TIP" | "DIGITAL_FILE" | "FLAT_OFFER";
  fileUrl?: string | null;
  isActive: boolean;
  order: number;
  _count?: { sales: number };
}

interface ProductsManagerTabProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  userPlan?: string | null;
  onStatusMsg?: (msg: string, type?: "success" | "error") => void;
}

function SortableProductRow({
  product,
  onToggle,
  onEdit,
  onDelete,
}: {
  product: Product;
  onToggle: (id: string, next: boolean) => void;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: product.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isDigital = product.type === "DIGITAL_FILE";
  const isTip = product.type === "TIP";
  const priceFormatted = `$${(product.priceInCents / 100).toFixed(2)}`;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-3.5 sm:p-4 rounded-xl border transition-all duration-150 flex items-center justify-between gap-3 ${
        isDragging
          ? "opacity-50 border-brand-500 bg-brand-50/20 dark:bg-brand-950/20 shadow-md"
          : "bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 shadow-2xs"
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-grab active:cursor-grabbing p-1 -ml-1 shrink-0"
          aria-label="Drag to reorder product"
        >
          <GripVertical className="w-4 h-4" />
        </button>

        <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 text-[var(--user-primary)]">
          {isDigital ? (
            <Download className="w-4 h-4" />
          ) : isTip ? (
            <Heart className="w-4 h-4 text-rose-500" />
          ) : (
            <Sparkles className="w-4 h-4 text-amber-500" />
          )}
        </div>

        <div className="min-w-0 space-y-0.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-xs sm:text-sm text-gray-900 dark:text-gray-100 truncate">
              {product.title}
            </span>
            <Badge variant="default" size="sm">
              {isDigital ? "Digital File" : isTip ? "Tip" : "Offer"}
            </Badge>
            <span className="font-mono font-bold text-xs text-gray-900 dark:text-gray-100">
              {priceFormatted}
            </span>
          </div>
          {product.description && (
            <p className="text-xs text-gray-500 dark:text-zinc-400 truncate max-w-md">
              {product.description}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Toggle
          checked={product.isActive}
          onChange={(checked) => onToggle(product.id, checked)}
          size="sm"
          aria-label="Toggle active product status"
        />

        <button
          type="button"
          onClick={() => onEdit(product)}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
          title="Edit product"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => onDelete(product.id)}
          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
          title="Delete product"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

export default ProductsManagerTab;
export function ProductsManagerTab({
  products,
  setProducts,
  userPlan,
  onStatusMsg,
}: ProductsManagerTabProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  // New product form state
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newPrice, setNewPrice] = useState("9.99");
  const [newType, setNewType] = useState<"TIP" | "DIGITAL_FILE" | "FLAT_OFFER">("DIGITAL_FILE");
  const [newFileUrl, setNewFileUrl] = useState("");

  const maxAllowed = getMaxActiveProducts(userPlan);
  const activeCount = products.filter((p) => p.isActive).length;
  const isLimitReached = activeCount >= maxAllowed && maxAllowed !== Infinity;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = products.findIndex((p) => p.id === active.id);
    const newIndex = products.findIndex((p) => p.id === over.id);
    const reordered = arrayMove(products, oldIndex, newIndex).map((p, index) => ({
      ...p,
      order: index,
    }));

    setProducts(reordered);

    try {
      await fetch("/api/products/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          products: reordered.map((p) => ({ id: p.id, order: p.order })),
        }),
      });
      onStatusMsg?.("Products reordered", "success");
    } catch {
      onStatusMsg?.("Failed to save product order", "error");
    }
  };

  const handleToggle = async (id: string, nextActive: boolean) => {
    if (nextActive && isLimitReached) {
      onStatusMsg?.(
        `Active product limit reached (${maxAllowed}). Upgrade your plan to activate more products.`,
        "error"
      );
      return;
    }

    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isActive: nextActive } : p))
    );

    try {
      const res = await fetch(`/api/products/${id}/toggle`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: nextActive }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Toggle failed");
      }
      onStatusMsg?.(nextActive ? "Product activated" : "Product paused", "success");
    } catch (err: any) {
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, isActive: !nextActive } : p))
      );
      onStatusMsg?.(err.message || "Failed to update status", "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    setProducts((prev) => prev.filter((p) => p.id !== id));

    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      onStatusMsg?.("Product deleted", "success");
    } catch {
      onStatusMsg?.("Failed to delete product", "error");
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    const parsedPrice = parseFloat(newPrice);
    if (isNaN(parsedPrice) || parsedPrice < 0.5) {
      setFormError("Price must be at least $0.50.");
      return;
    }
    const priceInCents = Math.round(parsedPrice * 100);

    setSaving(true);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle.trim(),
          description: newDescription.trim() || undefined,
          priceInCents,
          currency: "USD",
          type: newType,
          fileUrl: newType === "DIGITAL_FILE" ? newFileUrl.trim() || undefined : undefined,
          isActive: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create product");
      }

      setProducts((prev) => [...prev, data]);
      setNewTitle("");
      setNewDescription("");
      setNewPrice("9.99");
      setNewFileUrl("");
      setShowAddForm(false);
      onStatusMsg?.("Product created successfully!", "success");
    } catch (err: any) {
      setFormError(err.message || "Failed to create product");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const parsedPrice = (editingProduct.priceInCents / 100);
    if (isNaN(parsedPrice) || parsedPrice < 0.5) {
      setFormError("Price must be at least $0.50.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/products/${editingProduct.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editingProduct.title.trim(),
          description: editingProduct.description?.trim() || null,
          priceInCents: editingProduct.priceInCents,
          type: editingProduct.type,
          fileUrl: editingProduct.fileUrl?.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update product");
      }

      setProducts((prev) =>
        prev.map((p) => (p.id === editingProduct.id ? data : p))
      );
      setEditingProduct(null);
      onStatusMsg?.("Product updated successfully!", "success");
    } catch (err: any) {
      setFormError(err.message || "Failed to update product");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Plan Entitlement Notice */}
      <div className="p-4 rounded-xl bg-gray-50 dark:bg-zinc-850 border border-gray-200/80 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            <h3 className="text-xs font-bold text-gray-900 dark:text-gray-100">
              Active Products Limit
            </h3>
            <Badge variant={isLimitReached ? "default" : "brand"} size="sm">
              {activeCount} / {maxAllowed === Infinity ? "Unlimited" : maxAllowed} Active
            </Badge>
          </div>
          <p className="text-[11px] text-gray-500 dark:text-zinc-400 mt-0.5">
            Free tier includes 1 active product. Pro unlocks 5, and Business unlocks unlimited active products.
          </p>
        </div>

        {maxAllowed !== Infinity && (
          <Link
            href="/dashboard/monetization"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline shrink-0"
          >
            <span>Upgrade limits</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      {/* Add Product Button or Form */}
      {!showAddForm ? (
        <div className="flex justify-end">
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => {
              if (isLimitReached) {
                onStatusMsg?.(
                  `Active product limit reached (${maxAllowed}). Upgrade your plan to add more products.`,
                  "error"
                );
              }
              setShowAddForm(true);
            }}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product / Offer</span>
          </Button>
        </div>
      ) : (
        <Card className="border-brand-200 dark:border-brand-900/60 shadow-sm animate-in fade-in">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-brand-600" />
                <span>Create New Product or Offer</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 p-2.5 rounded-lg border border-red-200 dark:border-red-900/50">
                {formError}
              </p>
            )}

            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1">
                    Product Title *
                  </label>
                  <Input
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Lightroom Creator Presets Pack"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1">
                    Price (USD) *
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0.50"
                    required
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    placeholder="9.99"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1">
                  Product Type
                </label>
                <Select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as any)}
                >
                  <option value="DIGITAL_FILE">Digital File (Downloadable asset, guide, preset)</option>
                  <option value="TIP">Tip / Support (Flat audience tip)</option>
                  <option value="FLAT_OFFER">Flat Offer (1-on-1 shoutout, portfolio audit, service)</option>
                </Select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1">
                  Description (Optional)
                </label>
                <Textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Explain what the buyer receives upon payment..."
                  rows={2}
                  maxLength={500}
                />
              </div>

              {newType === "DIGITAL_FILE" && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1">
                    File Asset URL or Cloudinary Link
                  </label>
                  <Input
                    value={newFileUrl}
                    onChange={(e) => setNewFileUrl(e.target.value)}
                    placeholder="https://res.cloudinary.com/... or download URL"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">
                    Direct download link granted to buyers after payment completion.
                  </p>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={saving}
                >
                  Create Product
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Product List */}
      {products.length === 0 ? (
        <div className="py-10 px-4 rounded-xl border border-dashed border-gray-200 dark:border-zinc-800 text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-zinc-800 flex items-center justify-center mx-auto text-gray-400">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            No products listed yet
          </h4>
          <p className="text-xs text-gray-500 dark:text-zinc-400 max-w-sm mx-auto">
            Sell digital files, flat services, or offer fixed tip tiers directly on your Linkle profile with one-click Stripe payments.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowAddForm(true)}
            className="mt-2"
          >
            + Create your first product
          </Button>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={products.map((p) => p.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {products.map((product) => (
                <SortableProductRow
                  key={product.id}
                  product={product}
                  onToggle={handleToggle}
                  onEdit={(p) => setEditingProduct(p)}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <Modal
          isOpen={true}
          onClose={() => setEditingProduct(null)}
          title="Edit Product"
        >
          <form onSubmit={handleUpdateProduct} className="space-y-4">
            {formError && (
              <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">
                {formError}
              </p>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1">
                Title
              </label>
              <Input
                required
                value={editingProduct.title}
                onChange={(e) =>
                  setEditingProduct({ ...editingProduct, title: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1">
                  Price (USD)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0.50"
                  required
                  value={(editingProduct.priceInCents / 100).toFixed(2)}
                  onChange={(e) => {
                    const parsed = parseFloat(e.target.value);
                    setEditingProduct({
                      ...editingProduct,
                      priceInCents: isNaN(parsed) ? 50 : Math.round(parsed * 100),
                    });
                  }}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1">
                  Type
                </label>
                <Select
                  value={editingProduct.type}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      type: e.target.value as any,
                    })
                  }
                >
                  <option value="DIGITAL_FILE">Digital File</option>
                  <option value="TIP">Tip / Support</option>
                  <option value="FLAT_OFFER">Flat Offer</option>
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1">
                Description
              </label>
              <Textarea
                value={editingProduct.description || ""}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    description: e.target.value,
                  })
                }
                rows={2}
                maxLength={500}
              />
            </div>

            {editingProduct.type === "DIGITAL_FILE" && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1">
                  File Download URL
                </label>
                <Input
                  value={editingProduct.fileUrl || ""}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      fileUrl: e.target.value,
                    })
                  }
                  placeholder="https://..."
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditingProduct(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={saving}
              >
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
