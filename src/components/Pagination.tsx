import "./Pagination.css"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft, faAngleRight } from "@fortawesome/free-solid-svg-icons";
import type { PaginationProps } from "../types/props";

function Pagination({ currentPage, onPageChange, totalPages }:PaginationProps) {

    const renderPages=()=>{
        const pages=[];
        for (let i=1;i<=totalPages;i++){
            pages.push(<button
            key={i}
            onClick={() => onPageChange(i)}
            disabled={currentPage === i}
          >
            {i}
          </button>)
        }
        return pages;
    }

    return (
       <div className="pagination-container">
        <button onClick={()=>{
            if(currentPage>1){
                onPageChange(currentPage-1);
            }

        }}><FontAwesomeIcon icon={faAngleLeft} /></button>
        {renderPages()}
        <button onClick={()=>{
            if(currentPage<totalPages){
                onPageChange(currentPage+1);
            }
        }}><FontAwesomeIcon icon={faAngleRight} /></button>
       </div>
    )
          
    

}

export default Pagination
