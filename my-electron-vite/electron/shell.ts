import { exec } from 'child_process';

//ts
export const executeCommand = (command: string, options = {}): Promise<string> => {
  const final_options = { ...options}
  return new Promise((resolve, reject) => {
    exec(command, final_options, (error: Error | null, stdout: string, stderr: string) => {
      if (error) {
        reject(error);
      } else {
        resolve(stdout);
      }
    });
  });
};

export const executePowerShell = (powershellCommand: string, forceUTF8=true): Promise<string> => {
  const options =  {'shell':'powershell.exe'}
  let encodeutf8 = (forceUTF8)?"[Console]::OutputEncoding = [System.Text.Encoding]::UTF8":""
  return executeCommand(`
${encodeutf8}
${powershellCommand}
`, options)
};

// 
// export const executeWMI = (wmiQuery: string, useCIM:Boolean = false): Promise<string> => {
//   let type = useCIM?"Get-CimInstance":"Get-WmiObject"
//   // const wmiQuery = 'Get-WmiObject -Class Win32_Process';
//   return executePowerShell(`${type} ${wmiQuery}`)
// };


// 執行WMI查詢




// --- js ----
// const { exec } = require('child_process');

// exports.executeCommand = (command) => {
//   return new Promise((resolve, reject) => {
//     exec(command, (error, stdout, stderr) => {
//       if (error) {
//         reject(error);
//       } else {
//         resolve(stdout);
//       }
//     });
//   });
// };