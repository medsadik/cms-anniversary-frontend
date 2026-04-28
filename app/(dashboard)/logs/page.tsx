"use client"

import { useEffect, useState } from "react"
import { Search, Filter } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { useTranslation } from "@/hooks/use-translation"
import api from "@/lib/api"

interface EmailLog {
  id: string
  sentAt: string
  recipientEmail: string
  recipientName: string
  subject: string
  type: "BIRTHDAY" | "WORK_ANNIVERSARY"
  ccList: string[]
  status: "SENT" | "FAILED" | "PENDING"
}

export default function EmailLogsPage() {
  const { toast } = useToast()
  const t = useTranslation()
  const [logs, setLogs] = useState<EmailLog[]>([])
  const [filteredLogs, setFilteredLogs] = useState<EmailLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [dateFrom, setDateFrom] = useState<Date | undefined>()
  const [dateTo, setDateTo] = useState<Date | undefined>()
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 15

  useEffect(() => {
    fetchLogs()
  }, [])

  useEffect(() => {
    filterLogs()
  }, [searchQuery, filterType, filterStatus, dateFrom, dateTo, logs])

  const fetchLogs = async () => {
    try {
      const response = await api.get("/api/email-logs")
      setLogs(response.data.data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load email logs",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filterLogs = () => {
    let filtered = logs

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (log) =>
          log.recipientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          log.recipientEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          log.subject?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Type filter
    if (filterType !== "all") {
      filtered = filtered.filter((log) => log.type === filterType)
    }

    // Status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter((log) => log.status === filterStatus)
    }

    // Date range filter
    if (dateFrom) {
      filtered = filtered.filter((log) => new Date(log.sentAt) >= dateFrom)
    }
    if (dateTo) {
      filtered = filtered.filter((log) => new Date(log.sentAt) <= dateTo)
    }

    setFilteredLogs(filtered)
    setCurrentPage(1)
  }

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentLogs = filteredLogs.slice(startIndex, endIndex)

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SENT":
        return <Badge className="bg-green-500/10 text-green-500">Sent</Badge>
      case "FAILED":
        return <Badge className="bg-red-500/10 text-red-500">Failed</Badge>
      case "PENDING":
        return <Badge className="bg-yellow-500/10 text-yellow-500">Pending</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

const getTypeBadge = (type: string) => {
  switch (type) {
    case "BIRTHDAY":
      return <Badge className="bg-pink-500/10 text-pink-500">Birthday</Badge>

    case "WORK_ANNIVERSARY":
      return <Badge className="bg-purple-500/10 text-purple-500">Work Anniversary</Badge>

    case "TEST_BIRTHDAY":
      return <Badge className="bg-pink-500/10 text-pink-500 border border-pink-500/30">Birthday Test</Badge>

    case "TEST_WORK_ANNIVERSARY":
      return <Badge className="bg-purple-500/10 text-purple-500 border border-purple-500/30"> Work Anniversary Test</Badge>

    default:
      return <Badge className="bg-gray-500/10 text-gray-500">Unknown</Badge>
  }
}


  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">{t.logs.title}</h1>
        <p className="mt-2 text-muted-foreground">{t.logs.subtitle}</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
          <CardDescription>Find emails by recipient, date, type, or status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t.logs.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.logs.allTypes}</SelectItem>
                <SelectItem value="BIRTHDAY">{t.templates.birthday}</SelectItem>
                <SelectItem value="WORK_ANNIVERSARY">{t.templates.workAnniversary}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.logs.allStatuses}</SelectItem>
                <SelectItem value="SENT">{t.logs.sent}</SelectItem>
                <SelectItem value="FAILED">{t.logs.failed}</SelectItem>
                <SelectItem value="PENDING">{t.logs.pending}</SelectItem>
              </SelectContent>
            </Select>
{/* 
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="flex-1 bg-transparent">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFrom ? format(dateFrom, "MMM dd") : "From"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={dateFrom} onSelect={setDateFrom} initialFocus />
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="flex-1 bg-transparent">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateTo ? format(dateTo, "MMM dd") : "To"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={dateTo} onSelect={setDateTo} initialFocus />
                </PopoverContent>
              </Popover>
            </div> */}
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {filteredLogs.length} of {logs.length} emails
            </div>
            {(dateFrom || dateTo || filterType !== "all" || filterStatus !== "all" || searchQuery) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery("")
                  setFilterType("all")
                  setFilterStatus("all")
                  setDateFrom(undefined)
                  setDateTo(undefined)
                }}
              >
                {t.logs.clearFilters}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.logs.sentAt}</TableHead>
                  <TableHead>{t.logs.recipient}</TableHead>
                  <TableHead>{t.logs.subject}</TableHead>
                  <TableHead>{t.logs.type}</TableHead>
                  <TableHead>{t.employees.ccList}</TableHead>
                  <TableHead>{t.logs.status}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No email logs found
                    </TableCell>
                  </TableRow>
                ) : (
                  currentLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium">{formatDateTime(log.sentAt)}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{log.recipientName}</div>
                          <div className="text-sm text-muted-foreground">{log.recipientEmail}</div>
                        </div>
                      </TableCell>
                      <TableCell>{log.subject}</TableCell>
                      <TableCell>{getTypeBadge(log.type)}</TableCell>
                      <TableCell>
                        {log.ccList && log.ccList.length > 0 ? (
                          <div className="max-w-[200px] truncate text-sm text-muted-foreground">
                            {log.ccList}
                          </div>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(log.status)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
