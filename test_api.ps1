$body = @{
    model = "gemini-1.5-flash"
    messages = @(
        @{
            role = "user"
            content = "hi"
        }
    )
} | ConvertTo-Json -Depth 5

$headers = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer AIzaSyBvS7KtwT52oTEOmW8vYXT6Tod3jb0TU_4"
}

try {
    $response = Invoke-RestMethod -Uri "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions" -Method Post -Headers $headers -Body $body
    $response | ConvertTo-Json -Depth 5
} catch {
    Write-Host "Error details:"
    $stream = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($stream)
    $reader.ReadToEnd()
}
