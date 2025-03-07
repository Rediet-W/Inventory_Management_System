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
    fontSize: 12,
    marginBottom: 10,
    textAlign: "center",
  },
});

const SalesPDF = ({ sales, totalSales, header, dateRange }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Custom Header */}
      <Text style={styles.header}>{header}</Text>

      {/* Date Range */}
      <Text style={styles.dateRange}>{dateRange}</Text>
      <Text style={styles.header}>Sales Report</Text>
      <View style={styles.table}>
        {/* Table Header */}
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
            <Text style={styles.tableCell}>Unit Selling Price</Text>
          </View>
          <View style={styles.tableCol}>
            <Text style={styles.tableCell}>Total Selling Price</Text>
          </View>
        </View>

        {/* Table Rows */}
        {sales?.map((sale, index) => (
          <View style={styles.tableRow} key={index}>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>
                {sale?.createdAt?.split("T")[0] || "Unknown Date"}
              </Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>
                {sale.name || "Unknown Product"}
              </Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{sale.quantity}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{sale.unitSellingPrice} ETB</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>
                {sale.quantity * sale.unitSellingPrice} ETB
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
            <Text style={styles.tableCell}>{totalSales} ETB</Text>
          </View>
        </View>
      </View>
    </Page>
  </Document>
);

export default SalesPDF;
