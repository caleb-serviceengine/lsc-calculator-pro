import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

export interface CustomItem {
  id: number;
  name: string;
  description: string;
  price: string;
  addToBundle: boolean;
}

interface CustomItemsSectionProps {
  items: CustomItem[];
  onItemsChange: (items: CustomItem[]) => void;
}

const CustomItemsSection = ({ items, onItemsChange }: CustomItemsSectionProps) => {
  const [nextId, setNextId] = useState(1);

  const addItem = () => {
    onItemsChange([...items, { id: nextId, name: "", description: "", price: "", addToBundle: false }]);
    setNextId((prev) => prev + 1);
  };

  const removeItem = (id: number) => {
    onItemsChange(items.filter((item) => item.id !== id));
  };

  const updateItem = (id: number, field: keyof CustomItem, value: string | boolean) => {
    onItemsChange(
      items.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  return (
    <section className="bg-card p-6">
      <div className="space-y-4">
        {items.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 pr-2 text-muted-foreground font-medium w-10">#</th>
                  <th className="text-left py-2 px-2 text-muted-foreground font-medium">Item Name</th>
                  <th className="text-left py-2 px-2 text-muted-foreground font-medium">Description</th>
                  <th className="text-left py-2 px-2 text-muted-foreground font-medium w-32">Price</th>
                  <th className="text-center py-2 px-2 text-muted-foreground font-medium w-12">Add</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={item.id} className="border-b border-border/50">
                    <td className="py-2 pr-2 text-card-foreground font-medium">{index + 1}</td>
                    <td className="py-2 px-2">
                      <Input
                        type="text"
                        placeholder="Enter service name"
                        value={item.name}
                        onChange={(e) => updateItem(item.id, "name", e.target.value)}
                        className="bg-white border-border text-card-foreground h-9"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <Input
                        type="text"
                        placeholder="Optional details"
                        value={item.description}
                        onChange={(e) => updateItem(item.id, "description", e.target.value)}
                        className="bg-white border-border text-card-foreground h-9"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">$</span>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          value={item.price}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "" || parseFloat(val) >= 0) {
                              updateItem(item.id, "price", val);
                            }
                          }}
                          className="bg-white border-border text-card-foreground h-9 w-24"
                        />
                      </div>
                    </td>
                    <td className="py-2 px-2 text-center">
                      <Checkbox
                        checked={item.addToBundle}
                        onCheckedChange={(c) => updateItem(item.id, "addToBundle", c === true)}
                        disabled={!item.name.trim()}
                      />
                    </td>
                    <td className="py-2 pl-2">
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                        title="Remove item"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={addItem}
          className="gap-1.5"
        >
          <Plus className="w-4 h-4" />
          Add Custom Item
        </Button>
      </div>
    </section>
  );
};

export default CustomItemsSection;
