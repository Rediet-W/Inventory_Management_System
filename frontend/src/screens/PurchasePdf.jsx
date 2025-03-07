import React from "react";
import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    padding: 20,
    fontFamily: "Noto Sans Ethiopic",
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
    width: "20%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  tableCell: {
    margin: 5,
    fontSize: 10,
  },
  header: {
    fontSize: 14,
    marginBottom: 10,
    textAlign: "center",
    fontWeight: "bold",
  },
  dateRange: {
    fontSize: 8,
    marginBottom: 10,
    textAlign: "center",
  },
});

const PurchasesPDF = ({ purchases, totalPurchases, header, dateRange }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.header}>{header}</Text>

      <Text style={styles.dateRange}>{dateRange}</Text>
      <Text style={styles.header}>Purchase Report</Text>
      <View style={styles.table}>
        <View style={styles.tableRow}>
          <View style={styles.tableCol}>
            <Text style={styles.tableCell}>Date</Text>
          </View>
          <View style={styles.tableCol}>
            <Text style={styles.tableCell}>Name</Text>
          </View>
          <View style={styles.tableCol}>
            <Text style={styles.tableCell}>Quantity</Text>
          </View>
          <View style={styles.tableCol}>
            <Text style={styles.tableCell}>Unit Cost</Text>
          </View>
          <View style={styles.tableCol}>
            <Text style={styles.tableCell}>Total Cost</Text>
          </View>
        </View>

        {purchases?.map((purchase, index) => (
          <View style={styles.tableRow} key={index}>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>
                {purchase?.createdAt?.split("T")[0] || "Unknown Date"}
              </Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>
                {purchase.name || "Unknown Product"}
              </Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{purchase.quantity}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{purchase.unitCost} ETB</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>
                {purchase.quantity * purchase.unitCost} ETB
              </Text>
            </View>
          </View>
        ))}
        {/* Total Row */}
        <View style={styles.tableRow}>
          <View style={styles.tableCol}>
            <Text style={styles.tableCell}></Text>
          </View>
          <View style={styles.tableCol}>
            <Text style={styles.tableCell}></Text>
          </View>
          <View style={styles.tableCol}>
            <Text style={styles.tableCell}></Text>
          </View>
          <View style={styles.tableCol}>
            <Text style={styles.tableCell}>Total</Text>
          </View>
          <View style={styles.tableCol}>
            <Text style={styles.tableCell}>{totalPurchases} ETB</Text>
          </View>
        </View>
      </View>
    </Page>
  </Document>
);

export default PurchasesPDF;
