import React, { useState } from 'react';
import {formatBytes} from '../utils/utils'
import { apis } from '../ipc/ipc_apis.ts';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import { CircularProgress } from '@mui/material';
import Fade from '@mui/material/Fade';
function createData(name: string, value: string,) {
  return { name, value};
}


/**
 * 從 WMI 中獲取指定分類和屬性的資料, this is for sync one property
 * @param category 分類名稱
 * @param prop 屬性名稱
 * @param cb 回調函式，用於處理獲取的資料
 */
// function fetchdata(category, prop, cb){
// Get-WmiObject Win32_ComputerSystem | Select-Object -ExpandProperty Name;
// Get-WmiObject Win32_Processor | Select-Object -ExpandProperty Name; 
// Get-WmiObject Win32_OperatingSystem | Select-Object -ExpandProperty TotalVisibleMemorySize
// 
//   apis.executeWMI(`${category} | Select-Object ${prop}`).then(
//     (value) => {
//       cb(value)
//     }
//   ).catch(
//     (error) => {
//       console.log(error)
//     }
//   );
// }


/**
 * 從 PowerShell 中獲取指定類別的資訊並將其解析後傳遞給回調函式, this is for multiple properties
 * @param category 資訊類別的名稱
 * @param props 要選取的屬性列表
 * @param cb 回調函式，用於處理處理完的資訊
 */
function fetchdatas(category, props, cb){
  const useCIM = true
  let type = useCIM?"Get-CimInstance":"Get-WmiObject"
  // Get-CimInstance Win32_ComputerSystem | Select-Object "Model", "Name", "TotalPhysicalMemory" | Format-Table -HideTableHeaders
  apis.executePowerShell(`
      \$infos = ${type} ${category} | Select-Object ${props.join(",")}
      $props = ${props.map(prop => `"${prop}"`).join(",")}
      foreach (\$info in \$infos) {
        foreach (\$prop in \$props) {
          Write-Host "\$(\$info.$prop)"
        }
      }
  `).then(
    (value) => {
      // cb(value)
      const lines: string[] = value.split("\n").filter(line => line.trim() !== '');
      const infos = []
      let tmp = {}
      for (let i = 0; i < lines.length; i++) {
        const prop_i = i % props.length
        const key = props[prop_i];
        const value = lines[i];
        if (prop_i == 0){
          tmp = {}
          infos.push(tmp)
        }
        tmp[key] = value
      }
      // console.log(infos)
      cb(infos)
    }
  ).catch(
    (error) => {
      console.log(error)
    }
  );
}


export default function BasicTable() {
  let anyLoading = new Set<string>()
  const [rows, setRows] = useState([
    createData("Model", "----"),
    createData("Name", "----"),
    createData("TotalPhysicalMemory", "----"),
  ]);


    /**
   * 將資料插入到表格中，如果資料已存在則更新值，否則新增資料列
   * @param k 名稱
   * @param v 值
   */
  const insertData = (k: string,v: string) => {
    let found=false
    for (const r of rows){
      if (r.name == k){
        r.value = v
        found = true
        setRows(prevData => [...prevData])
        break
      }
    }
    if (!found){
      setRows(prevData => [...prevData, createData(k, v)])
    }
  };

  /**
   * 更新資料，從 WMI 中獲取並插入到表格中
   */
  const updateData = () => {

    //example: fetchdata("Win32_ComputerSystem", "-ExpandProperty Model", (v)=> {insertData("Model", v)})
    anyLoading.add("Win32_ComputerSystem")
    fetchdatas("Win32_ComputerSystem", ["Model", "Name", "TotalPhysicalMemory"], (infos)=> {
      for(const i in infos){
        insertData("Model", infos[i]["Model"])
        insertData("Name", infos[i]["Name"])

        const h = formatBytes(infos[i]["TotalPhysicalMemory"])
        insertData("TotalPhysicalMemory", h)
      }
      anyLoading.delete("Win32_ComputerSystem")
    })

    anyLoading.add("Win32_DiskDrive")
    fetchdatas("Win32_DiskDrive", ["DeviceID", "Model", "Size"], infos=>{
      for(const i in infos){
        insertData(`${infos[i]["DeviceID"]}`, `${infos[i]["Model"]}\n${formatBytes(infos[i]["Size"])}`)
      }
      anyLoading.delete("Win32_DiskDrive")
    })
    
  }

  return (
    <>
    <TableContainer component={Paper} className="table-container">
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell align="center">Key</TableCell>
            <TableCell align="center">Value</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.name}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell component="th" scope="row" align="left">
                  {row.name}
              </TableCell>
              <TableCell align="center" sx={{ whiteSpace: 'pre-line' }}>{row.value}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
    <Button variant="contained" onClick={updateData}>
        Click Me to Fetch Data
      </Button>
    </>
  );
}