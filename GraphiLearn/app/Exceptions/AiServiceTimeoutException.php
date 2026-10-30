<?php

namespace App\Exceptions;

class AiServiceTimeoutException extends AiServiceException
{
    public function __construct(string $message = "Tiempo de espera agotado al comunicarse con el microservicio de procesamiento.")
    {
        parent::__construct($message, 504);
    }
}
