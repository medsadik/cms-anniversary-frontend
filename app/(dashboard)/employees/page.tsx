"use client"

import { useEffect, useState } from "react"
import { Search } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useTranslation } from "@/hooks/use-translation"
import { EmployeeEditorDialog } from "@/components/employee-editor-dialog"
import api from "@/lib/api"

interface Employee {
  id: string
  firstName: string
  lastName: string
  email: string
  birthDate: string
  entryDate: string
  manager: string
  ccListEmails: string[]
}

export default function EmployeesPage() {
  const { toast } = useToast()
  const t = useTranslation()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterManager] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const itemsPerPage = 10

  
  useEffect(() => {
    filterEmployees()
  }, [searchQuery, filterManager, employees])
  
  useEffect(() => {
    fetchEmployees()
  }, [])
  const fetchEmployees = async () => {
    try {
      const response = await api.get("/api/employees")
      setEmployees(response.data.data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load employees",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filterEmployees = () => {
    let filtered = employees

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (emp) =>
          emp.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          emp.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          emp.email.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Manager filter
    if (filterManager !== "all") {
      filtered = filtered.filter((emp) => emp.manager === filterManager)
    }

    setFilteredEmployees(filtered)
    setCurrentPage(1)
  }

  // Pagination
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentEmployees = filteredEmployees.slice(startIndex, endIndex)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const handleEmployeeClick = (employee: Employee) => {
    setSelectedEmployee(employee)
    setIsEditorOpen(true)
  }

  const handleSaveEmployee = async (updatedEmployee: Employee) => {
    try {
      await api.post(`/api/employees/${updatedEmployee.email}/cc-list`, updatedEmployee.ccListEmails)

      // Update local state
      setEmployees((prev) => prev.map((emp) => (emp.id === updatedEmployee.id ? updatedEmployee : emp)))

      toast({
        title: "Success",
        description: "ccList updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update ccList",
        variant: "destructive",
      })
      throw error
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
        <h1 className="text-3xl font-bold">{t.employees.title}</h1>
        <p className="mt-2 text-muted-foreground">{t.employees.subtitle}</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
          <CardDescription>Find employees by name, email, or manager</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t.employees.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            {/* <Select value={filterManager} onValueChange={setFilterManager}>
              <SelectTrigger className="w-full md:w-[200px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by manager" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Managers</SelectItem>
                {managers.map((manager) => (
                  <SelectItem key={manager} value={manager}>
                    {manager}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select> */}
          </div>
          <div className="text-sm text-muted-foreground">
            Showing {filteredEmployees.length} of {employees.length} employees
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
                  <TableHead>{t.employees.name}</TableHead>
                  <TableHead>{t.employees.email}</TableHead>
                  <TableHead>{t.employees.birthDate}</TableHead>
                  <TableHead>{t.employees.entryDate}</TableHead>
                  {/* <TableHead>{t.employees.manager}</TableHead> */}
                  <TableHead>{t.employees.ccList}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentEmployees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No employees found
                    </TableCell>
                  </TableRow>
                ) : (
                  currentEmployees.map((employee) => (
                    <TableRow
                      key={employee.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleEmployeeClick(employee)}
                    >
                      <TableCell className="font-medium">
                        {employee.firstName} {employee.lastName}
                      </TableCell>
                      <TableCell>{employee.email}</TableCell>
                      <TableCell>{formatDate(employee.birthDate)}</TableCell>
                      <TableCell>{formatDate(employee.entryDate)}</TableCell>
                      {/* <TableCell>{employee.manager || "—"}</TableCell> */}
                      <TableCell>
                        {employee.ccListEmails && employee.ccListEmails.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {employee.ccListEmails.slice(0, 2).map((email) => (
                              <Badge key={email} variant="secondary" className="max-w-[160px] truncate block">
                                {email}
                              </Badge>
                            ))}
                            {employee.ccListEmails.length > 2 && (
                              <Badge variant="outline">+{employee.ccListEmails.length - 2} more</Badge>
                            )}
                          </div>
                        ) : "—"}
                      </TableCell>
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

      {/* Employee Editor Dialog */}
      <EmployeeEditorDialog
        open={isEditorOpen}
        onOpenChange={setIsEditorOpen}
        employee={selectedEmployee}
        onSave={handleSaveEmployee}
        employees={employees}
      />
    </div>
  )
}
