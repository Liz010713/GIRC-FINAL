package com.girc.exception;

import com.girc.dto.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(
            MethodArgumentNotValidException ex,
            HttpServletRequest request
    ) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining("; "));
        return buildError(HttpStatus.BAD_REQUEST, "BAD_REQUEST_VALIDACION", message, request);
    }

    @ExceptionHandler({
            MethodArgumentTypeMismatchException.class,
            MissingServletRequestParameterException.class,
            HttpMessageNotReadableException.class
    })
    public ResponseEntity<ErrorResponse> handleBadRequest(
            Exception ex,
            HttpServletRequest request
    ) {
        String message = "Parámetro o formato de solicitud inválido: " + ex.getMessage();
        return buildError(HttpStatus.BAD_REQUEST, "BAD_REQUEST_PARAMETRO_INVALIDO", message, request);
    }

    @ExceptionHandler(RecursoNoEncontradoException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(
            RecursoNoEncontradoException ex,
            HttpServletRequest request
    ) {
        return buildError(HttpStatus.NOT_FOUND, ex.getErrorCode(), ex.getMessage(), request);
    }

    @ExceptionHandler(ConflictoNegocioException.class)
    public ResponseEntity<ErrorResponse> handleBusinessConflict(
            ConflictoNegocioException ex,
            HttpServletRequest request
    ) {
        return buildError(HttpStatus.CONFLICT, "CONFLICTO_NEGOCIO", ex.getMessage(), request);
    }

    @ExceptionHandler(StockInsuficienteException.class)
    public ResponseEntity<ErrorResponse> handleInsufficientStock(
            StockInsuficienteException ex,
            HttpServletRequest request
    ) {
        return buildError(HttpStatus.UNPROCESSABLE_ENTITY, "STOCK_INSUFICIENTE", ex.getMessage(), request);
    }

    private ResponseEntity<ErrorResponse> buildError(
            HttpStatus status,
            String errorCode,
            String message,
            HttpServletRequest request
    ) {
        ErrorResponse body = new ErrorResponse(
                OffsetDateTime.now(ZoneOffset.UTC),
                status.value(),
                errorCode,
                message,
                request.getRequestURI()
        );
        return ResponseEntity.status(status).body(body);
    }
}
