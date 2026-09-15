/**
 * Starts a browser download of text content. The object URL is revoked after a delay: revoking it
 * right after `click()` can cancel the download in some browsers, since the download starts asynchronously.
 */
export const downloadText = (content: string, fileName: string, mimeType: string): void => {
  const url = URL.createObjectURL(new Blob([content], { type: mimeType }))
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.hidden = true
  document.body.append(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 60_000)
}
