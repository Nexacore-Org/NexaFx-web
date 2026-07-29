export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fall back to the legacy path below.
  }

  try {
    if (typeof document === "undefined") {
      return false;
    }

    const textArea = document.createElement("textarea");
    let copied = false;
    textArea.value = text;
    textArea.setAttribute("readonly", "");
    textArea.style.position = "fixed";
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.width = "1px";
    textArea.style.height = "1px";
    textArea.style.padding = "0";
    textArea.style.border = "0";
    textArea.style.outline = "0";
    textArea.style.boxShadow = "none";
    textArea.style.background = "transparent";
    textArea.style.opacity = "0";

    document.body.appendChild(textArea);
    try {
      textArea.select();
      textArea.setSelectionRange(0, textArea.value.length);
      copied = document.execCommand("copy");
    } finally {
      document.body.removeChild(textArea);
    }

    return copied;
  } catch {
    return false;
  }
};
