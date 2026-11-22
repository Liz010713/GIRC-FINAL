# Exportar la entrega a PDF y Word

El Documento Maestro tiene fuentes Markdown/Mermaid. El script `exportar-entrega.ps1` renderiza las seis fuentes Mermaid a PNG y SVG, integra el Documento Maestro, el diccionario, trazabilidad RNF, evidencia SOLID y ADRs, y genera DOCX y PDF.

## Requisitos en Windows

- Python 3
- Node.js/npm y acceso a npm para Mermaid CLI
- Google Chrome o Microsoft Edge
- Pandoc (se instala como binario Python)

## Instalar Pandoc

```powershell
python -m pip install --user pypandoc-binary
```

## Generar los entregables

Desde la raíz del repositorio, en PowerShell:

```powershell
.\scripts\hito-2\exportar-entrega.ps1
```

El script escribe en `docs/hito-2`:

- `Documento-Maestro-Parcial-2.docx`
- `Documento-Maestro-Parcial-2.pdf`
- Figuras `.png` y `.svg` en `rendered/`

El Markdown consolidado y el HTML de impresión se generan en una carpeta temporal. Usa `-SkipDiagrams` cuando solo cambie el texto y las figuras renderizadas estén actualizadas.
