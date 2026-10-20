package pe.hvacsolutions.common;

import java.util.Map;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.converter.HttpMessageNotReadableException;

@RestControllerAdvice
public class ApiErrors {
    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<Map<String, String>> invalid(MethodArgumentNotValidException e) {
        return ResponseEntity.badRequest().body(Map.of("error", "Revisa los campos obligatorios y los formatos"));
    }
    @ExceptionHandler(HttpMessageNotReadableException.class)
    ResponseEntity<Map<String, String>> malformed(HttpMessageNotReadableException e) {
        return ResponseEntity.badRequest().body(Map.of("error", "Solicitud inválida"));
    }
    @ExceptionHandler(ResponseStatusException.class)
    ResponseEntity<Map<String, String>> expected(ResponseStatusException e) {
        return ResponseEntity.status(e.getStatusCode()).body(Map.of("error", e.getReason() == null ? "Error" : e.getReason()));
    }
    @ExceptionHandler(DataIntegrityViolationException.class)
    ResponseEntity<Map<String, String>> conflict(DataIntegrityViolationException e) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", "Esta operación ya fue registrada o existen datos duplicados"));
    }
}
