param([switch]$SkipDiagrams)

$ErrorActionPreference = 'Stop'

$repo = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..\..')).Path
$docs = Join-Path $repo 'docs\hito-2'
$diagramSource = Join-Path $docs 'diagrams'
$rendered = Join-Path $docs 'rendered'
New-Item -ItemType Directory -Force -Path $rendered | Out-Null

$chromeCandidates = @(
    'C:\Program Files\Google\Chrome\Application\chrome.exe',
    'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
)
$chrome = $chromeCandidates | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $chrome) {
    throw 'Instala Google Chrome o Microsoft Edge antes de renderizar Mermaid.'
}

$puppeteerConfig = Join-Path $env:TEMP "girc-mermaid-$PID.json"
$configJson = @{
    executablePath = $chrome
    args = @('--no-sandbox', '--disable-setuid-sandbox')
} | ConvertTo-Json
[System.IO.File]::WriteAllText(
    $puppeteerConfig,
    $configJson,
    [System.Text.UTF8Encoding]::new($false)
)

try {
    if (-not $SkipDiagrams) {
        Get-ChildItem -LiteralPath $diagramSource -Filter '*.mmd' | ForEach-Object {
            $png = Join-Path $rendered ($_.BaseName + '.png')
            $svg = Join-Path $rendered ($_.BaseName + '.svg')
            foreach ($figurePath in @($png, $svg)) {
                npx.cmd --yes @mermaid-js/mermaid-cli@11.4.2 `
                    -p $puppeteerConfig `
                    -i $_.FullName `
                    -o $figurePath `
                    -b white `
                    -w 1600 -H 1400 -s 2
                if ($LASTEXITCODE -ne 0) {
                    throw "Mermaid no pudo renderizar $figurePath."
                }
            }
        }
    }
}
finally {
    Remove-Item -LiteralPath $puppeteerConfig -Force -ErrorAction SilentlyContinue
}

$pandoc = (python -c 'import pypandoc; print(pypandoc.get_pandoc_path())').Trim()
if (-not (Test-Path -LiteralPath $pandoc) -and (Test-Path -LiteralPath ($pandoc + '.exe'))) {
    $pandoc += '.exe'
}
if (-not (Test-Path -LiteralPath $pandoc)) {
    throw 'No se encontro Pandoc. Instalalo con: python -m pip install --user pypandoc-binary'
}

$utf8 = [System.Text.Encoding]::UTF8
$utf8NoBom = [System.Text.UTF8Encoding]::new($false)
$em = [char]0x2014
$dot = [char]0x00B7
$oAcute = [char]0x00F3
$iAcute = [char]0x00ED
$eAcute = [char]0x00E9
$aAcute = [char]0x00E1

$maestroFull = [System.IO.File]::ReadAllText((Join-Path $docs 'Documento-Maestro-Parcial-2.md'), $utf8)
$bodyStartIndex = $maestroFull.IndexOf('## 1. Alcance de la entrega')
if ($bodyStartIndex -lt 0) {
    throw 'No se encontro el inicio de la seccion 1 en Documento-Maestro-Parcial-2.md.'
}
$maestroBody = $maestroFull.Substring($bodyStartIndex)

$sections = [System.Collections.Generic.List[string]]::new()
$sections.Add($maestroBody)
$sections.Add("`n# Anexo A $em Diagramas renderizados`n")
$figures = @(
    @("C4 Nivel 1 $em Diagrama de Contexto", 'c4-contexto'),
    @("C4 Nivel 2 $em Diagrama de Contenedores", 'c4-contenedores'),
    @("C4 Nivel 3 $em Diagrama de Componentes del Backend", 'c4-componentes-backend'),
    @("UML $em Diagrama de Clases de Dominio", 'uml-clases-dominio'),
    @("UML $em Diagrama de Secuencia Full Stack (Crear Pedido)", 'uml-secuencia-crear-pedido'),
    @("UML $em Diagrama de Despliegue", 'uml-despliegue')
)
foreach ($figure in $figures) {
    $sections.Add("`n## $($figure[0])`n")
    $sections.Add("![$($figure[0])](rendered/$($figure[1]).png){width=6.3in}`n")
}
$sections.Add("`n# Anexo B $em Diccionario de datos y mapeo ORM`n")
$dictionary = [System.IO.File]::ReadAllText((Join-Path $docs 'persistencia\diccionario-datos.md'), $utf8)
$sections.Add(($dictionary -replace '\]\(\.\./', ']('))
$sections.Add("`n# Anexo C $em Trazabilidad RNF`n")
$sections.Add([System.IO.File]::ReadAllText((Join-Path $docs 'Trazabilidad-RNF.md'), $utf8))
$sections.Add("`n# Anexo D $em Evidencia SOLID y patrones`n")
$sections.Add([System.IO.File]::ReadAllText((Join-Path $docs 'Evidencia-SOLID-y-patrones.md'), $utf8))
$sections.Add("`n# Anexo E $em Registros de Decisiones Arquitect${oAcute}nicas (ADRs)`n")
Get-ChildItem -LiteralPath (Join-Path $docs 'adr') -Filter 'ADR-*.md' | Sort-Object Name | ForEach-Object {
    $sections.Add([System.IO.File]::ReadAllText($_.FullName, $utf8))
}

$coverHtmlContent = @'
<section class="cover-page">
  <div class="cover-kicker">Ingenier&iacute;a de Software II &middot; Parcial 2</div>
  <h1 class="cover-title">Documento Maestro &mdash; Parcial 2</h1>
  <p class="cover-subtitle">GIRC &middot; Gesti&oacute;n Integral de Recursos y Comercializaci&oacute;n</p>
  <table class="cover-table">
    <tbody>
      <tr><th>Asignatura</th><td>Ingenier&iacute;a de Software II</td></tr>
      <tr><th>Docente</th><td>Yan Angarita Sanguino</td></tr>
      <tr><th>Integrantes</th><td>Jackeline P&eacute;rez Parada y Juana Lizett Gonz&aacute;lez</td></tr>
      <tr><th>Instituci&oacute;n</th><td>Tecnol&oacute;gico de Antioquia (TdeA) &ndash; Instituci&oacute;n Universitaria</td></tr>
      <tr><th>Fecha de revisi&oacute;n</th><td>22 de noviembre de 2026</td></tr>
      <tr><th>Repositorio GitHub</th><td><a href="https://github.com/jackelineperez/GIRC">https://github.com/jackelineperez/GIRC</a></td></tr>
    </tbody>
  </table>
  <p class="cover-note">Consolidado de arquitectura de software, Modelo C4, modelado UML, dise&ntilde;o de persistencia ORM/JPA, principios SOLID, patrones de dise&ntilde;o, ADRs y pruebas automatizadas.</p>
</section>
'@

$tempRoot = (Resolve-Path -LiteralPath $env:TEMP).Path
$tempName = 'girc-export-' + [guid]::NewGuid().ToString('N')
$tempPath = Join-Path $tempRoot $tempName
New-Item -ItemType Directory -Path $tempPath | Out-Null

try {
    $combined = Join-Path $tempPath 'Documento-Maestro-Consolidado.md'
    $coverHtml = Join-Path $tempPath 'portada.html'
    [System.IO.File]::WriteAllText($combined, ($sections -join "`n`n"), $utf8NoBom)
    [System.IO.File]::WriteAllText($coverHtml, $coverHtmlContent, $utf8NoBom)

    $docx = Join-Path $docs 'Documento-Maestro-Parcial-2.docx'
    $pdf = Join-Path $docs 'Documento-Maestro-Parcial-2.pdf'
    $html = Join-Path $tempPath 'Documento-Maestro-Consolidado.html'
    $css = Join-Path $PSScriptRoot 'exportacion.css'

    $docxTitle = "Documento Maestro $em Parcial 2"
    $docxSubtitle = "GIRC $dot Gesti${oAcute}n Integral de Recursos y Comercializaci${oAcute}n $em Tecnol${oAcute}gico de Antioquia (TdeA) $dot Ingenier${iAcute}a de Software II $dot Docente: Yan Angarita Sanguino"
    $docxAuthor = "Jackeline P${eAcute}rez Parada y Juana Lizett Gonz${aAcute}lez"

    & $pandoc $combined --from=markdown --to=docx --standalone --toc `
        "--metadata=title=$docxTitle" `
        "--metadata=subtitle=$docxSubtitle" `
        "--metadata=author=$docxAuthor" `
        '--metadata=date=22 de noviembre de 2026' `
        '--metadata=toc-title=Tabla de contenido' `
        '--metadata=lang=es-CO' `
        "--resource-path=$docs" `
        "--output=$docx"
    if ($LASTEXITCODE -ne 0 -or -not (Test-Path -LiteralPath $docx)) {
        throw 'Pandoc no pudo generar el documento Word.'
    }

    & $pandoc $combined --from=markdown --to=html5 --standalone --toc --embed-resources `
        '--metadata=pagetitle=GIRC - Documento Maestro Parcial 2' `
        '--metadata=toc-title=Tabla de contenido' `
        '--metadata=lang=es-CO' `
        "--include-before-body=$coverHtml" `
        "--resource-path=$docs" `
        "--css=$css" `
        "--output=$html"
    if ($LASTEXITCODE -ne 0 -or -not (Test-Path -LiteralPath $html)) {
        throw 'Pandoc no pudo generar el HTML intermedio para PDF.'
    }

    $htmlUri = ([System.Uri]$html).AbsoluteUri
    $browserProfile = Join-Path $tempPath 'browser-profile'
    $pendingPdf = Join-Path $tempPath 'Documento-Maestro-Parcial-2.pdf'
    $browserArgs = @('--headless', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
        '--no-pdf-header-footer', "--user-data-dir=`"$browserProfile`"", "--print-to-pdf=`"$pendingPdf`"", $htmlUri)
    $browser = Start-Process -FilePath $chrome -ArgumentList $browserArgs -WindowStyle Hidden -Wait -PassThru
    if ($browser.ExitCode -ne 0 -or -not (Test-Path -LiteralPath $pendingPdf)) {
        throw 'El navegador no pudo imprimir el PDF.'
    }
    Move-Item -LiteralPath $pendingPdf -Destination $pdf -Force
}
finally {
    $resolved = (Resolve-Path -LiteralPath $tempPath).Path
    if ($resolved -eq (Join-Path $tempRoot $tempName)) {
        Remove-Item -LiteralPath $resolved -Recurse -Force
    }
}

Get-Item -LiteralPath $docx, $pdf | Select-Object Name, Length, FullName
