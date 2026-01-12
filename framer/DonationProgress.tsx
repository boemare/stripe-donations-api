import { useEffect, useState } from "react"
import { addPropertyControls, ControlType } from "framer"

interface DonationData {
  donorCount: number
  totalAmount: number
  goalDonors: number
  goalAmount: number
  amountPercent: number
  donorPercent: number
}

interface Props {
  apiUrl: string
  showAmount: boolean
  showDonors: boolean
  amountBarColor: string
  donorBarColor: string
  backgroundColor: string
  textColor: string
  barHeight: number
  borderRadius: number
  refreshInterval: number
}

export default function DonationProgress({
  apiUrl = "https://your-api.vercel.app/api/donations",
  showAmount = true,
  showDonors = true,
  amountBarColor = "#22c55e",
  donorBarColor = "#3b82f6",
  backgroundColor = "#e5e7eb",
  textColor = "#1f2937",
  barHeight = 24,
  borderRadius = 12,
  refreshInterval = 60,
}: Props) {
  const [data, setData] = useState<DonationData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(apiUrl)
        if (!res.ok) throw new Error("Failed to fetch")
        const json = await res.json()
        setData(json)
        setError(null)
      } catch (err) {
        setError("Unable to load donation data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    // Refresh data at specified interval
    if (refreshInterval > 0) {
      const interval = setInterval(fetchData, refreshInterval * 1000)
      return () => clearInterval(interval)
    }
  }, [apiUrl, refreshInterval])

  const containerStyle: React.CSSProperties = {
    width: "100%",
    fontFamily: "system-ui, -apple-system, sans-serif",
    color: textColor,
  }

  const progressBarContainerStyle: React.CSSProperties = {
    background: backgroundColor,
    borderRadius: borderRadius,
    height: barHeight,
    overflow: "hidden",
    position: "relative",
  }

  const labelStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 8,
    fontSize: 14,
    fontWeight: 500,
  }

  const sectionStyle: React.CSSProperties = {
    marginBottom: 20,
  }

  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={{ ...progressBarContainerStyle, opacity: 0.5 }}>
          <div
            style={{
              width: "30%",
              height: "100%",
              background: `linear-gradient(90deg, ${backgroundColor} 0%, #d1d5db 50%, ${backgroundColor} 100%)`,
              animation: "pulse 1.5s ease-in-out infinite",
            }}
          />
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div style={{ ...containerStyle, textAlign: "center", padding: 20 }}>
        <p style={{ color: "#ef4444" }}>{error || "No data available"}</p>
      </div>
    )
  }

  return (
    <div style={containerStyle}>
      {showAmount && (
        <div style={sectionStyle}>
          <div style={labelStyle}>
            <span>Amount Raised</span>
            <span>
              ${data.totalAmount.toLocaleString()} of ${data.goalAmount.toLocaleString()}
            </span>
          </div>
          <div style={progressBarContainerStyle}>
            <div
              style={{
                width: `${data.amountPercent}%`,
                height: "100%",
                background: amountBarColor,
                borderRadius: borderRadius,
                transition: "width 0.5s ease-out",
              }}
            />
          </div>
        </div>
      )}

      {showDonors && (
        <div style={sectionStyle}>
          <div style={labelStyle}>
            <span>Donors</span>
            <span>
              {data.donorCount} of {data.goalDonors}
            </span>
          </div>
          <div style={progressBarContainerStyle}>
            <div
              style={{
                width: `${data.donorPercent}%`,
                height: "100%",
                background: donorBarColor,
                borderRadius: borderRadius,
                transition: "width 0.5s ease-out",
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

// Framer Property Controls
addPropertyControls(DonationProgress, {
  apiUrl: {
    type: ControlType.String,
    title: "API URL",
    defaultValue: "https://your-api.vercel.app/api/donations",
    description: "Your Vercel API endpoint URL",
  },
  showAmount: {
    type: ControlType.Boolean,
    title: "Show Amount",
    defaultValue: true,
  },
  showDonors: {
    type: ControlType.Boolean,
    title: "Show Donors",
    defaultValue: true,
  },
  amountBarColor: {
    type: ControlType.Color,
    title: "Amount Bar",
    defaultValue: "#22c55e",
  },
  donorBarColor: {
    type: ControlType.Color,
    title: "Donor Bar",
    defaultValue: "#3b82f6",
  },
  backgroundColor: {
    type: ControlType.Color,
    title: "Background",
    defaultValue: "#e5e7eb",
  },
  textColor: {
    type: ControlType.Color,
    title: "Text Color",
    defaultValue: "#1f2937",
  },
  barHeight: {
    type: ControlType.Number,
    title: "Bar Height",
    defaultValue: 24,
    min: 8,
    max: 64,
    step: 4,
  },
  borderRadius: {
    type: ControlType.Number,
    title: "Roundness",
    defaultValue: 12,
    min: 0,
    max: 32,
    step: 2,
  },
  refreshInterval: {
    type: ControlType.Number,
    title: "Refresh (sec)",
    defaultValue: 60,
    min: 0,
    max: 300,
    step: 10,
    description: "0 = no auto-refresh",
  },
})
