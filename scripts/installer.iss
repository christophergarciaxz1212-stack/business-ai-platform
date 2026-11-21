; BUSINESS AI - Inno Setup installer
#define MyAppName "BUSINESS AI"
#define MyAppVersion "1.0.0"
#define MyAppPublisher "BusinessAI"
#define MyAppURL "https://localhost:8080"

[Setup]
AppId={{A1B2C3D4-E5F6-7890-ABCD-EF1234567890}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
DefaultDirName={autopf}\{#MyAppName}
DefaultGroupName={#MyAppName}
OutputDir=dist
OutputBaseFilename=BusinessAI-Setup
Compression=lzma
SolidCompression=yes
WizardStyle=modern

[Files]
Source: "*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: ".env.example"; DestDir: "{app}"; DestName: ".env"; Flags: onlyifdoesntexist

[Icons]
Name: "{group}\{#MyAppName}"; Filename: "{app}\scripts\start.ps1"; WorkingDir: "{app}"
Name: "{autodesktop}\{#MyAppName}"; Filename: "powershell.exe"; Parameters: "-ExecutionPolicy Bypass -File ""{app}\scripts\start.ps1"""; WorkingDir: "{app}"

[Run]
Filename: "powershell.exe"; Parameters: "-ExecutionPolicy Bypass -File ""{app}\scripts\start.ps1"""; Description: "Iniciar BusinessAI"; Flags: nowait postinstall skipifsilent