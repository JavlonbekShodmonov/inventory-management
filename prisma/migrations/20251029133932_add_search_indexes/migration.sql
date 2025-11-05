-- CreateIndex
CREATE INDEX "Inventory_title_idx" ON "Inventory"("title");

-- CreateIndex
CREATE INDEX "Inventory_description_idx" ON "Inventory"("description");

-- CreateIndex
CREATE INDEX "Item_customId_idx" ON "Item"("customId");

-- CreateIndex
CREATE INDEX "Item_stringField1_idx" ON "Item"("stringField1");

-- CreateIndex
CREATE INDEX "Item_stringField2_idx" ON "Item"("stringField2");

-- CreateIndex
CREATE INDEX "Item_stringField3_idx" ON "Item"("stringField3");
