"use client";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { CalendarIcon } from "@radix-ui/react-icons";
import axios from "axios";
import { format } from "date-fns";
import { useEffect, useState } from "react";
interface SearchFilters {
  searchFilter: string;
  pageLimit: string;
  sortBy: string;
  sortOrder: string;
}
interface SwapData {
  timestamp: number;
  date: string;
  time: string;
  in_asset: string;
  in_amount: number;
  in_amount_usd: number;
  out_asset_1: string;
  out_amount_1: number;
  out_amount_1_usd: number;
  in_address: string;
  out_address_1: string;
  tx_id: string;
  out_asset_2?: string;
  out_amount_2?: number;
  out_amount_2_usd?: number;
  out_address_2?: string;
}

export default function Home() {
  const [isLoading, setLoading] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    searchFilter: "",
    pageLimit: "50",
    sortBy: "timestamp",
    sortOrder: "DESC",
  });
  const [date, setDate] = useState<Date>();
  const [page, setPage] = useState(1);
  const [records, setRecords] = useState<SwapData[]>([]);

  const { toast } = useToast();

  function handlePageChange(value: number) {
    if (value <= 0) {
      return;
    }
    setPage(value);
  }
  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: `Copied: ${text}`,
        duration: 2000,
      });
    } catch (err) {
      console.error("Failed to copy: ", err);
      toast({
        title: "Copy Failed",
        description: "Could not copy text. Please try again.",
        variant: "destructive",
      });
    }
  };
  const BACKEND_ENDPOINT = "http://127.0.0.1:3000/swaps";
  function formatDateToDDMMYYYY(date: Date) {
    if (!date) return null;

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${year}-${month}-${day}`;
  }
  const FetchSwapsData = async () => {
    setLoading(true);
    try {
      const reqBody = {
        sort_by: filters.sortBy,
        page: String(page),
        limit: filters.pageLimit,
        order: filters.sortOrder,
        search: filters.searchFilter,
        date: date ? formatDateToDDMMYYYY(date) : null,
      };
      console.log(reqBody);
      console.log(process.env.NEXT_PUBLIC_API_URL);
      const resp = await axios.post(
        process.env.NEXT_PUBLIC_API_URL || "",
        reqBody,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      setRecords(resp.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log(filters, page);
    FetchSwapsData();
  }, [filters, page, date]);
  return (
    <Card>
      <CardHeader>
        <Card>
          <CardContent className="space-y-2 m-4 flex flex-col gap-3">
            <Input
              placeholder="Search TxID or Wallet Address"
              onChange={(e) => {
                setFilters((prev) => ({
                  ...prev,
                  searchFilter: e.target.value,
                }));
              }}
            />
            {/* Sort By Select */}
            <div className="flex gap-10 items-center justify-center">
              <Select
                value={filters.sortBy}
                onValueChange={(val) => {
                  setFilters((prev) => ({ ...prev, sortBy: val }));
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="timestamp" defaultChecked>
                    Timestamp
                  </SelectItem>
                  <SelectItem value="in_amount_usd">In Amount USD</SelectItem>
                  <SelectItem value="out_amount_1_usd">
                    Out Amount USD
                  </SelectItem>
                </SelectContent>
              </Select>
              {/* Sort Order Select */}
              <Select
                value={filters.sortOrder}
                onValueChange={(val) => {
                  setFilters((prev) => ({ ...prev, sortOrder: val }));
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Order" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ASC">Low to High</SelectItem>
                  <SelectItem value="DESC">High to Low</SelectItem>
                </SelectContent>
              </Select>
              {/* Page Limit Select */}
              <Select
                value={filters.pageLimit}
                onValueChange={(val) => {
                  setFilters((prev) => ({ ...prev, pageLimit: val }));
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Page Limit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 per Page</SelectItem>
                  <SelectItem value="50">50 per Page</SelectItem>
                  <SelectItem value="100">100 per Page</SelectItem>
                </SelectContent>
              </Select>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={`w-[240px] justify-start text-left font-normal text-muted-foreground`}
                  >
                    <CalendarIcon />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}{" "}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(val) => {
                      setDate(val);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </CardContent>
        </Card>
      </CardHeader>
      <CardContent>
        <Table className="overflow-x-auto scrollbar-hidden">
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead className="text-center">inAsset</TableHead>
              <TableHead className="text-center">outAsset</TableHead>
              <TableHead className="text-center">inAmount</TableHead>
              <TableHead className="text-center">inAmountUSD</TableHead>
              <TableHead className="text-center">outAmount</TableHead>
              <TableHead className="text-center">outAmountUSD</TableHead>
              <TableHead className="text-center">outAsset2</TableHead>
              <TableHead className="text-center">outAmount2</TableHead>
              <TableHead className="text-center">outUSD2</TableHead>
              <TableHead>inAddress</TableHead>
              <TableHead>outAddress</TableHead>
              <TableHead className="text-center">outAddress2</TableHead>
              <TableHead>Tx Id</TableHead>
            </TableRow>
          </TableHeader>
          {records.length != 0 && (
            <TableBody>
              {records.map((swap, index) => {
                return (
                  <TableRow key={index}>
                    <TableCell>{swap.date}</TableCell>
                    <TableCell className="text-center">
                      {swap.in_asset}
                    </TableCell>
                    <TableCell className="text-center">
                      {swap.out_asset_1}
                    </TableCell>
                    <TableCell className="text-center">
                      {swap.in_amount}
                    </TableCell>
                    <TableCell className="text-center">
                      {swap.in_amount_usd}
                    </TableCell>
                    <TableCell className="text-center">
                      {swap.out_amount_1}
                    </TableCell>
                    <TableCell className="text-center">
                      {swap.out_amount_1_usd}
                    </TableCell>
                    <TableCell className="text-center">
                      {swap.out_asset_2 || "NA"}
                    </TableCell>
                    <TableCell className="text-center">
                      {swap.out_amount_2 || "NA"}
                    </TableCell>
                    <TableCell className="text-center">
                      {swap.out_amount_2_usd || "NA"}
                    </TableCell>
                    <TableCell
                      onClick={() => handleCopy(swap.in_address)}
                      className="hover:bg-slate-200 cursor-pointer"
                    >
                      {swap.in_address.slice(0, 10) +
                        (swap.in_address.length > 10 ? "..." : "")}
                    </TableCell>
                    <TableCell
                      onClick={() => handleCopy(swap.out_address_1)}
                      className="hover:bg-slate-200 cursor-pointer"
                    >
                      {swap.out_address_1.slice(0, 10) +
                        (swap.out_address_1.length > 10 ? "..." : "")}
                    </TableCell>
                    <TableCell
                      onClick={() => handleCopy(swap.out_address_2 || "")}
                      className="hover:bg-slate-200 cursor-pointer"
                    >
                      {swap.out_address_2
                        ? swap.out_address_2.slice(0, 10) +
                          (swap.out_address_2.length > 10 ? "..." : "")
                        : "NA"}
                    </TableCell>
                    <TableCell
                      onClick={() => handleCopy(swap.tx_id)}
                      className="hover:bg-slate-200 cursor-pointer"
                    >
                      {swap.tx_id}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          )}
        </Table>
      </CardContent>
      <CardFooter className="flex flex-col items-center gap-5">
        {records.length === 0 && (
          <span className="w-full text-center text-lg">No records Found</span>
        )}
        {isLoading && (
          <span className="w-full text-center text-lg">Loading</span>
        )}
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => {
                  handlePageChange(page - 1);
                }}
              />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink>{page}</PaginationLink>
            </PaginationItem>

            <PaginationItem>
              <PaginationNext
                onClick={() => {
                  handlePageChange(page + 1);
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </CardFooter>
    </Card>
  );
}
