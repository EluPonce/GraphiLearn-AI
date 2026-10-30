<?php

namespace App\Exceptions;

class AiServiceUnavailableException extends AiServiceException
{
    public function __construct(string $message = "El microservicio de procesamiento de imágenes (FastAPI) no está disponible.")
    {
        parent::__construct($message, 503);
    }
}
