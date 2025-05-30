import React from 'react';
import validate from 'helpers/validate';
import Form from 'molecules/Form';

const FormData = () => (
    <Form>
        <Form.Row label="Name" required>
            <Form.Control
                name="name"
                validators={[{
                    isValid: validate.required(),
                    message: 'Please enter a name.',
                }]}
            >
                <Form.Control.TextField />
            </Form.Control>
        </Form.Row>
    </Form>
);

export default FormData;
