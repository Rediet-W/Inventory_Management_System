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
    width: "16.66%", // Adjust based on the number of columns
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
});

const PurchasePDF = ({ purchases, date }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <Text style={styles.header}>Products to Shop</Text>
      <Text style={styles.date}>Date: {date}</Text>

      {/* Table */}
      <View style={styles.table}>
        {/* Table Header */}
        <View style={styles.tableRow}>
          <View style={styles.tableCol}>
            <Text style={styles.tableCell}>No.</Text>
          </View>
          <View style={styles.tableCol}>
            <Text style={styles.tableCell}>Batch No.</Text>
          </View>
          <View style={styles.tableCol}>
            <Text style={styles.tableCell}>Description</Text>
          </View>
          <View style={styles.tableCol}>
            <Text style={styles.tableCell}>UOM</Text>
          </View>
          <View style={styles.tableCol}>
            <Text style={styles.tableCell}>Quantity</Text>
          </View>
          <View style={styles.tableCol}>
            <Text style={styles.tableCell}>Unit Cost</Text>
          </View>
        </View>

        {/* Table Rows */}
        {purchases.map((purchase, index) => (
          <View style={styles.tableRow} key={index}>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{index + 1}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{purchase.batchNumber}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{purchase.name}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{purchase.unitOfMeasurement}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{purchase.quantity}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{purchase.unitCost}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text>I have received the above listed items</Text>
        <Text>Name: </Text>
        <View style={styles.signatureLine} />
        <Text>Date: </Text>
        <View style={styles.signatureLine} />
        <Text>Signature: </Text>
        <View style={styles.signatureLine} />
      </View>
    </Page>
  </Document>
);

export default PurchasePDF;
