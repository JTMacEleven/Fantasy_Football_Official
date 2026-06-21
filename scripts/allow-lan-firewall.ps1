# Run PowerShell as Administrator, then:
netsh advfirewall firewall add rule name="AfroAngel API 3010" dir=in action=allow protocol=TCP localport=3010 profile=private,public
netsh advfirewall firewall add rule name="AfroAngel Metro 8081" dir=in action=allow protocol=TCP localport=8081 profile=private,public
Write-Host "Firewall rules added. Phone can reach API on your LAN IP."
