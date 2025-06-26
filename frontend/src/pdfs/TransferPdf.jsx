import React from "react";
import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    padding: 20,
    fontFamily: "Noto Sans Ethiopic",
  },
  header: {
    fontSize: 14,
    marginBottom: 10,
    textAlign: "center",
    fontWeight: "bold",
  },
  date: {
    fontSize: 12,
    marginBottom: 20,
    textAlign: "center",
  },
  table: {
    display: "table",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    flexDirection: "row",
  },
  tableCol: {
    width: "12.5%", // Adjust based on the number of columns
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  tableCell: {
    margin: 5,
    fontSize: 10,
  },
  footer: {
    marginTop: 20,
    fontSize: 10,
    textAlign: "start",
    gap: 3,
  },
  signatureLine: {
    borderBottom: "1px dashed black",
    width: "25%",
    alignSelf: "center",
  },
  topic: {
    fontWeight: "bold",
    marginVertical: "8px",
  },
});

const TransferPDF = ({ transfers, date, header }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <Text style={styles.header}>{header}</Text>

      <Text style={styles.header}>Product Transfer to Shop</Text>
      <Text style={styles.date}>Date: {date}</Text>

      {/* Table */}
      <View style={styles.table}>
        {/* Table Header */}
        <View style={styles.tableRow}>
          <View style={styles.tableCol}>
            <Text style={styles.tableCell}>No.</Text>
          </View>
          <View style={styles.tableCol}>
            <Text style={styles.tableCell}>Product</Text>
          </View>
          <View style={styles.tableCol}>
            <Text style={styles.tableCell}>Batch No.</Text>
          </View>
          <View style={styles.tableCol}>
            <Text style={styles.tableCell}>UOM</Text>
          </View>
          <View style={styles.tableCol}>
            <Text style={styles.tableCell}>Selling Price</Text>
          </View>
          <View style={styles.tableCol}>
            <Text style={styles.tableCell}>Qty in Store</Text>
          </View>
          <View style={styles.tableCol}>
            <Text style={styles.tableCell}>Qty to Transfer</Text>
          </View>
          <View style={styles.tableCol}>
            <Text style={styles.tableCell}>Reorder Level</Text>
          </View>
        </View>

        {/* Table Rows */}
        {transfers.map((transfer, index) => (
          <View style={styles.tableRow} key={transfer.id}>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{index + 1}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{transfer.product}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{transfer.batchNumber}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{transfer.unitOfMeasurement}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{transfer.sellingPrice}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{transfer.qty}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>
                {transfer.quantityToTransfer}
              </Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{transfer.reorderLevel}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.topic}>I have received the above listed items</Text>
        <Text>Signature: </Text>
        <View style={styles.signatureLine} />
        <Text>Name: </Text>
        <View style={styles.signatureLine} />
        <Text>Date: </Text>
        <View style={styles.signatureLine} />
        <Text style={styles.topic}>DELIVERED BY</Text>
        <Text>Signature: </Text>
        <View style={styles.signatureLine} />
        <Text>Name: </Text>
        <View style={styles.signatureLine} />
        <Text>Date: </Text>
        <View style={styles.signatureLine} />
      </View>
    </Page>
  </Document>
);

export default TransferPDF;
