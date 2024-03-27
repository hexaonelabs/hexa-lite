

export const getQrcodeAsSVG = async (value: string) => {
  const QRCode = await import("qrcode").then((module) => module);
  try {
    return await QRCode.toString(value, {
      type: 'svg'
    })
  } catch (err: any) {
    throw new Error(err?.message || "Error generating QR code")
  }
}