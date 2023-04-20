import React, { useMemo, useState, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import { Paper } from "@mui/material";
import TextField from "@mui/material/TextField";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-material.css";
import "./App.css";
import axios from "axios";

const App = () => {
  const gridApi = useRef(null);
  const [rowData, setRowData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);

  const formatNumber = (number) => {
    return number.toFixed(2);
  };
  const NumericCellRenderer = ({ value }) => {
    return <span>{formatNumber(value)}</span>;
  };
  const onSearchTextChange = (event) => {
    const searchText = event.target.value;
    setSearchText(searchText);
    if (gridApi.current) {
      gridApi.current.setQuickFilter("");
      gridApi.current.setQuickFilter(searchText);
    }
  };
  const onSelectionChanged = () => {
    const selectedNodes = gridApi.current.getSelectedNodes();
    const selectedData = selectedNodes.map((node) => node.data);
    setSelectedRows(selectedData);
  };
  function handleDeleteSelected() {
    const selectedRows = gridApi.current.getSelectedRows();
    selectedRows.forEach((row) => {
      fetch("http://localhost:8080/api/deleteClusterEvents/" + row.eventId, {
        method: "PUT",
      })
        .then((response) => response.json())
        .then((data) => console.log(data))
        .catch((error) => console.error(error));
    });
  }
  const gridOptions = {
    rowSelection: 'multiple',
    onSelectionChanged: onSelectionChanged,
  };
  const columnDefs = [
    {
      headerName: "Cluster Event ID",
      field: "eventId",
      filter: "agNumberColumnFilter",
      sortable: true,
      width: "250px",
      editable: false,
      pinned: "left",
      checkboxSelection: true,
    },
    {
      headerName: "Tag 1",
      field: "tag1",
      filter: "agTextColumnFilter",
      sortable: true,
      width: "250px",
    },
    {
      headerName: "Tag 2",
      field: "tag2",
      filter: "agTextColumnFilter",
      sortable: true,
      width: "250px",
    },
    {
      headerName: "Tag 3",
      field: "tag3",
      filter: "agTextColumnFilter",
      sortable: true,
      width: "250px",
    },
    {
      headerName: "Metrics 1",
      field: "metrics1",
      filter: "agNumberColumnFilter",
      sortable: true,
      width: "250px",
      cellRendererFramework: NumericCellRenderer,
    },
    {
      headerName: "Metrics 2",
      field: "metrics2",
      filter: "agNumberColumnFilter",
      sortable: true,
      width: "250px",
      cellRendererFramework: NumericCellRenderer,
    },
  ];

  const onGridReady = async (params) => {
    const response = await axios.get(
      "http://localhost:8080/api/findAllClusterEvents"
    );
    const data = response.data;
    setRowData(data);
    params.api.sizeColumnsToFit();
    gridApi.current = params.api;
  };

  const handleCellValueChanged = (params) => {
    const updatedData = params.api.getDisplayedRowAtIndex(params.rowIndex).data;
    console.log(updatedData);
    axios
      .put(
        "http://localhost:8080/api/updateClusterEvents/" + updatedData.eventId,
        updatedData
      )
      .then((response) => {
        // handle success
      })
      .catch((error) => {
        // handle error
      });
  };

  const defaultColDef = useMemo(() => {
    return {
      sortable: true,
      editable: true,
      filter: true,
      resizable: true,
      suppressMenuHide: true,
    };
  }, []);

  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" style={{ textAlign: "center" }}>
            iRageCapital FullStack Application for Event Clusters
          </Typography>
        </Toolbar>
      </AppBar>
      <Paper elevation={3} style={{ padding: "20px", margin: "30px", display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
        <TextField
          id="outlined-basic"
          label="Search For Anything"
          variant="outlined"
          onChange={onSearchTextChange}
        />
        <Button variant="outlined" onClick={handleDeleteSelected}>
          Delete Events
        </Button>
      </Paper>
      <Paper elevation={3} style={{ padding: "20px", margin: "30px" }}>
        <div
          className="ag-theme-material"
          style={{ height: "500px", width: "100%" }}
        >
          <AgGridReact
            gridOptions={gridOptions}
            columnDefs={columnDefs}
            sortable={true}
            pagination={true}
            suppressMenuHide={true}
            paginationPageSize={10}
            onCellValueChanged={handleCellValueChanged}
            defaultColDef={defaultColDef}
            onGridReady={onGridReady}
            rowData={rowData}
          ></AgGridReact>
        </div>
      </Paper>
    </div>
  );
};

export default App;
