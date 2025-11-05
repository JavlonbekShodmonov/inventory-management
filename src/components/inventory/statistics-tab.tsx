import { prisma } from "@/lib/prisma";
import StatisticsTabClient from "../inventory/statistics-tab-client";

interface StatisticsTabProps {
  inventoryId: string;
}

export default async function StatisticsTab({
  inventoryId,
}: StatisticsTabProps) {
  // Get inventory with items and fields
  const inventory = await prisma.inventory.findUnique({
    where: { id: inventoryId },
    include: {
      items: true,
      fields: {
        orderBy: {
          order: "asc",
        },
      },
    },
  });

  if (!inventory) {
    return <div>Inventory not found</div>;
  }

  const items = inventory.items;
  const fields = inventory.fields;

  // Calculate statistics
  const totalItems = items.length;

  // Group fields by type
  const numberFields = fields.filter((f) => f.fieldType.startsWith("NUMBER"));
  const stringFields = fields.filter((f) => f.fieldType.startsWith("STRING"));
  const textFields = fields.filter((f) => f.fieldType.startsWith("TEXT"));
  const boolFields = fields.filter((f) => f.fieldType.startsWith("BOOL"));

  // Calculate numeric statistics
  const numericStats = numberFields.map((field) => {
    const fieldKey = field.fieldType.toLowerCase();
    const values = items
      .map((item: any) => item[fieldKey])
      .filter((v) => v !== null && v !== undefined && !isNaN(v));

    if (values.length === 0) {
      return {
        field,
        count: 0,
        average: null,
        min: null,
        max: null,
        sum: null,
      };
    }

    const sum = values.reduce((acc, val) => acc + val, 0);
    const average = sum / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);

    return {
      field,
      count: values.length,
      average: average.toFixed(2),
      min,
      max,
      sum: sum.toFixed(2),
    };
  });

  // Calculate string field statistics (most frequent values)
  const stringStats = [...stringFields, ...textFields].map((field) => {
    const fieldKey = field.fieldType.toLowerCase();
    const values = items
      .map((item: any) => item[fieldKey])
      .filter((v) => v !== null && v !== undefined && v.trim() !== "");

    if (values.length === 0) {
      return {
        field,
        count: 0,
        unique: 0,
        mostFrequent: [],
      };
    }

    // Count frequencies
    const frequencies: Record<string, number> = {};
    values.forEach((val) => {
      frequencies[val] = (frequencies[val] || 0) + 1;
    });

    // Sort by frequency
    const sorted = Object.entries(frequencies)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    return {
      field,
      count: values.length,
      unique: Object.keys(frequencies).length,
      mostFrequent: sorted,
    };
  });

  // Calculate boolean statistics
  const boolStats = boolFields.map((field) => {
    const fieldKey = field.fieldType.toLowerCase();
    const values = items
      .map((item: any) => item[fieldKey])
      .filter((v) => v !== null && v !== undefined);

    const trueCount = values.filter((v) => v === true).length;
    const falseCount = values.filter((v) => v === false).length;

    return {
      field,
      total: values.length,
      trueCount,
      falseCount,
      truePercentage: values.length > 0 ? ((trueCount / values.length) * 100).toFixed(1) : "0",
    };
  });

  // Calculate creation statistics
  const now = new Date();
  const last7Days = items.filter(
    (item) =>
      new Date(item.createdAt) > new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  ).length;
  const last30Days = items.filter(
    (item) =>
      new Date(item.createdAt) > new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  ).length;

  // Pass all calculated data to the client component
  return (
    <StatisticsTabClient
      totalItems={totalItems}
      last7Days={last7Days}
      last30Days={last30Days}
      fieldsCount={fields.length}
      numericStats={numericStats}
      stringStats={stringStats}
      boolStats={boolStats}
      hasItems={items.length > 0}
    />
  );
}