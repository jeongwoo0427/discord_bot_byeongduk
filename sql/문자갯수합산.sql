SELECT LENGTH(M.content),M.* FROM message M

WHERE M.messageNo >= 59000 
AND (content LIKE '!%' OR content LIKE '*%' OR content LIKE '^%')
ORDER BY M.cdt DESC;